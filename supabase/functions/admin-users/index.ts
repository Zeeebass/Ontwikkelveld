import { createClient } from 'npm:@supabase/supabase-js@2'
import { generateMemorablePassword, normalizeLoginName, toAuthEmail } from '../_shared/credentials.ts'

type CreatePlayerInput = {
  action: 'create_player'
  loginName: string
  firstName: string
  lastName: string
  position?: string | null
  shirtNumber?: number | null
}

type ResetPasswordInput = { action: 'reset_password'; playerId: string }
type SetActiveInput = { action: 'set_active'; playerId: string; active: boolean }
type RequestBody = CreatePlayerInput | ResetPasswordInput | SetActiveInput

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
const allowedOrigins = (Deno.env.get('APP_ORIGINS') ?? 'http://127.0.0.1:5173,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

function corsHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function assertCreatePlayer(input: CreatePlayerInput) {
  const loginName = normalizeLoginName(input.loginName)
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(loginName)) throw new Error('Gebruik 3–32 letters, cijfers, punten, streepjes of underscores voor de loginnaam.')
  if (!input.firstName?.trim() || !input.lastName?.trim()) throw new Error('Voornaam en achternaam zijn verplicht.')
  if (input.shirtNumber != null && (!Number.isInteger(input.shirtNumber) || input.shirtNumber < 1 || input.shirtNumber > 99)) throw new Error('Het rugnummer moet tussen 1 en 99 liggen.')
  return loginName
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin')
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (request.method !== 'POST') return json({ error: 'Methode niet toegestaan.' }, 405, origin)
  if (!supabaseUrl || !serviceKey) return json({ error: 'De serverconfiguratie is niet compleet.' }, 500, origin)

  const bearer = request.headers.get('Authorization')
  if (!bearer?.startsWith('Bearer ')) return json({ error: 'Log opnieuw in.' }, 401, origin)

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const token = bearer.slice('Bearer '.length)
  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'Je sessie is niet geldig.' }, 401, origin)

  const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).maybeSingle()
  if (profile?.role !== 'admin') return json({ error: 'Alleen een admin kan accounts beheren.' }, 403, origin)

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Het verzoek bevat geen geldige gegevens.' }, 400, origin)
  }

  try {
    if (body.action === 'create_player') {
      const loginName = assertCreatePlayer(body)
      const password = generateMemorablePassword()
      const { data: authData, error: createError } = await admin.auth.admin.createUser({
        email: toAuthEmail(loginName),
        password,
        email_confirm: true,
        user_metadata: { login_name: loginName },
      })
      if (createError || !authData.user) throw new Error(createError?.message.includes('already') ? 'Deze loginnaam bestaat al.' : 'Het account kon niet worden aangemaakt.')

      const userId = authData.user.id
      const { data: insertedProfile, error: profileError } = await admin
        .from('profiles')
        .insert({
          id: userId,
          login_name: loginName,
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          role: 'player',
        })
        .select('id')
        .single()

      if (profileError || !insertedProfile) {
        await admin.auth.admin.deleteUser(userId)
        throw new Error(profileError?.code === '23505' ? 'Deze loginnaam bestaat al.' : 'Het spelersprofiel kon niet worden aangemaakt.')
      }

      const { data: player, error: playerError } = await admin
        .from('players')
        .insert({
          profile_id: userId,
          position: body.position?.trim() || null,
          shirt_number: body.shirtNumber ?? null,
        })
        .select('id')
        .single()

      if (playerError || !player) {
        await admin.auth.admin.deleteUser(userId)
        throw new Error('Het spelersprofiel kon niet worden voltooid.')
      }

      return json({ playerId: player.id, loginName, password }, 201, origin)
    }

    const { data: player, error: playerError } = await admin
      .from('players')
      .select('profile_id, active')
      .eq('id', body.playerId)
      .single()
    if (playerError || !player) return json({ error: 'Speler niet gevonden.' }, 404, origin)

    if (body.action === 'reset_password') {
      const password = generateMemorablePassword()
      const { error } = await admin.auth.admin.updateUserById(player.profile_id, { password })
      if (error) throw new Error('Het wachtwoord kon niet worden vernieuwd.')
      return json({ password }, 200, origin)
    }

    if (body.action === 'set_active') {
      if (body.active) {
        const { error: authError } = await admin.auth.admin.updateUserById(player.profile_id, { ban_duration: 'none' })
        if (authError) throw new Error('Het account kon niet worden geactiveerd.')
        const { error } = await admin.from('players').update({ active: true }).eq('id', body.playerId)
        if (error) {
          await admin.auth.admin.updateUserById(player.profile_id, { ban_duration: '876000h' })
          throw new Error('De spelerstatus kon niet worden bijgewerkt; de toegang blijft geblokkeerd.')
        }
      } else {
        const { error } = await admin.from('players').update({ active: false }).eq('id', body.playerId)
        if (error) throw new Error('De spelerstatus kon niet worden bijgewerkt.')
        const { error: authError } = await admin.auth.admin.updateUserById(player.profile_id, { ban_duration: '876000h' })
        if (authError) {
          await admin.from('players').update({ active: true }).eq('id', body.playerId)
          throw new Error('Het account kon niet worden geband; de spelerstatus is teruggezet.')
        }
      }
      return json({ active: body.active }, 200, origin)
    }

    return json({ error: 'Onbekende actie.' }, 400, origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Er ging iets mis bij accountbeheer.'
    return json({ error: message }, 400, origin)
  }
})
