import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
export const hasSupabaseConfig = Boolean(supabaseUrl && publishableKey)

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

export function requireSupabase() {
  if (!supabase) throw new Error('Supabase is nog niet geconfigureerd. Vul eerst de VITE_SUPABASE-variabelen in.')
  return supabase
}
