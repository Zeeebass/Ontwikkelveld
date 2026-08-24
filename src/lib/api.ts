import type {
  AdminDashboardData,
  AdminPlayerDetail,
  AdminPlayerRow,
  ConvertLearningItemInput,
  CreatePlayerInput,
  MediaInput,
  MyDashboardData,
  Period,
  PlayerMedia,
  PlayerProfileInput,
  PlayerQuestion,
  ProgressEntry,
  ProgressInput,
  QuestionInput,
  RecentProgress,
  TeamGrowthRow,
  UserContext,
} from '../types/app'
import {
  demoAdminDashboard,
  demoAdminPlayer,
  demoAdminPlayers,
  demoCreatePeriod,
  demoCreatePlayer,
  demoConvertLearningItem,
  demoDeleteMedia,
  demoDeletePeriod,
  demoDeleteProgress,
  demoDeleteQuestion,
  demoContext,
  demoMyDashboard,
  demoPeriods,
  demoRenamePeriod,
  demoResetPassword,
  demoSaveMedia,
  demoSaveProgress,
  demoSaveQuestion,
  demoSetActive,
  demoSetPeriod,
  demoTeamGrowth,
  demoUpdatePlayer,
} from './demo'
import { getErrorMessage } from './errors'
import { isDemoMode, requireSupabase } from './supabase'
import { getYouTubeId } from './youtube'

type LooseRow = Record<string, unknown>

const objectRelation = (value: unknown): LooseRow => {
  if (Array.isArray(value)) return (value[0] as LooseRow | undefined) ?? {}
  return (value as LooseRow | null) ?? {}
}

const mapPeriod = (row: LooseRow): Period => ({
  id: String(row.id),
  name: String(row.name),
  sortOrder: Number(row.sort_order),
  isCurrent: Boolean(row.is_current),
  createdAt: row.created_at ? String(row.created_at) : undefined,
})

const mapProgress = (row: LooseRow): ProgressEntry => {
  const period = objectRelation(row.periods)
  return {
    id: String(row.id),
    playerId: String(row.player_id),
    periodId: String(row.period_id),
    periodName: String(period.name ?? ''),
    points: Number(row.points),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
  }
}

const mapQuestion = (row: LooseRow): PlayerQuestion => {
  const period = objectRelation(row.periods)
  return {
    id: String(row.id),
    playerId: String(row.player_id),
    periodId: row.period_id ? String(row.period_id) : null,
    periodName: period.name ? String(period.name) : null,
    question: String(row.question),
    answer: String(row.answer),
    category: row.category ? String(row.category) : null,
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  }
}

const mapMedia = (row: LooseRow): PlayerMedia => {
  const period = objectRelation(row.periods)
  return {
    id: String(row.id),
    playerId: String(row.player_id),
    periodId: row.period_id ? String(row.period_id) : null,
    periodName: period.name ? String(period.name) : null,
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    url: String(row.url),
    mediaType: row.media_type === 'youtube' ? 'youtube' : 'link',
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  }
}

async function signedAvatarUrls(paths: Array<string | null>) {
  const unique = [...new Set(paths.filter((path): path is string => Boolean(path)))]
  if (!unique.length) return new Map<string, string>()
  const { data } = await requireSupabase().storage.from('player-avatars').createSignedUrls(unique, 3600)
  return new Map((data ?? []).filter((item) => item.signedUrl).map((item) => [item.path, item.signedUrl]))
}

export async function getMyContext(): Promise<UserContext> {
  if (isDemoMode) return demoContext()
  const { data, error } = await requireSupabase().rpc('get_my_context')
  if (error) throw error
  const row = (data?.[0] ?? null) as LooseRow | null
  if (!row) throw new Error('Er is geen Marpunten-profiel aan dit account gekoppeld.')
  return {
    role: row.role === 'admin' ? 'admin' : 'player',
    playerId: row.player_id ? String(row.player_id) : null,
    fullName: String(row.full_name),
    active: Boolean(row.active),
  }
}

export async function getTeamGrowth(): Promise<TeamGrowthRow[]> {
  if (isDemoMode) return demoTeamGrowth()
  const { data, error } = await requireSupabase().rpc('get_team_growth_summary')
  if (error) throw error
  const rows = (data ?? []) as LooseRow[]
  const urls = await signedAvatarUrls(rows.map((row) => row.avatar_path ? String(row.avatar_path) : null))
  return rows.map((row) => ({
    currentPeriodId: row.current_period_id ? String(row.current_period_id) : null,
    currentPeriodName: row.current_period_name ? String(row.current_period_name) : null,
    playerId: String(row.player_id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    position: row.position ? String(row.position) : null,
    shirtNumber: row.shirt_number == null ? null : Number(row.shirt_number),
    avatarPath: row.avatar_path ? String(row.avatar_path) : null,
    avatarUrl: row.avatar_path ? urls.get(String(row.avatar_path)) ?? null : null,
    currentPoints: Number(row.current_points),
    totalPoints: Number(row.total_points),
  }))
}

export async function getPeriods(): Promise<Period[]> {
  if (isDemoMode) return demoPeriods()
  const { data, error } = await requireSupabase().from('periods').select('*').order('sort_order')
  if (error) throw error
  return (data as LooseRow[]).map(mapPeriod)
}

export async function getMyDashboard(): Promise<MyDashboardData> {
  if (isDemoMode) return demoMyDashboard()
  const context = await getMyContext()
  if (!context.playerId) throw new Error('Dit account is niet aan een speler gekoppeld.')
  const client = requireSupabase()
  const [periodResult, progressResult, questionsResult, mediaResult] = await Promise.all([
    client.from('periods').select('*').eq('is_current', true).maybeSingle(),
    client.from('progress_entries').select('*, periods(name)').eq('player_id', context.playerId).order('created_at', { ascending: false }),
    client.from('player_questions').select('*, periods(name)').eq('player_id', context.playerId).order('sort_order'),
    client.from('player_media').select('*, periods(name)').eq('player_id', context.playerId).order('sort_order'),
  ])
  const error = periodResult.error ?? progressResult.error ?? questionsResult.error ?? mediaResult.error
  if (error) throw error
  const progress = ((progressResult.data ?? []) as LooseRow[]).map(mapProgress)
  const currentPeriod = periodResult.data ? mapPeriod(periodResult.data as LooseRow) : null
  return {
    context,
    progress,
    questions: ((questionsResult.data ?? []) as LooseRow[]).map(mapQuestion),
    media: ((mediaResult.data ?? []) as LooseRow[]).map(mapMedia),
    totalPoints: progress.reduce((sum, item) => sum + item.points, 0),
    currentPoints: progress.filter((item) => item.periodId === currentPeriod?.id).reduce((sum, item) => sum + item.points, 0),
    currentPeriod,
  }
}

export async function getAdminPlayers(): Promise<AdminPlayerRow[]> {
  if (isDemoMode) return demoAdminPlayers()
  const { data, error } = await requireSupabase()
    .from('players')
    .select('id, profile_id, position, shirt_number, avatar_path, active, profiles!inner(login_name, first_name, last_name), progress_entries(points)')
    .order('active', { ascending: false })
    .order('shirt_number', { ascending: true, nullsFirst: false })
  if (error) throw error
  const rows = data as LooseRow[]
  const urls = await signedAvatarUrls(rows.map((row) => row.avatar_path ? String(row.avatar_path) : null))
  return rows.map((row) => {
    const profile = objectRelation(row.profiles)
    const entries = (row.progress_entries as LooseRow[] | null) ?? []
    return {
      id: String(row.id), profileId: String(row.profile_id), loginName: String(profile.login_name),
      firstName: String(profile.first_name), lastName: String(profile.last_name),
      position: row.position ? String(row.position) : null, shirtNumber: row.shirt_number == null ? null : Number(row.shirt_number),
      avatarPath: row.avatar_path ? String(row.avatar_path) : null,
      avatarUrl: row.avatar_path ? urls.get(String(row.avatar_path)) ?? null : null,
      active: Boolean(row.active), totalPoints: entries.reduce((sum, entry) => sum + Number(entry.points), 0),
    }
  })
}

export async function getAdminPlayer(playerId: string): Promise<AdminPlayerDetail> {
  if (isDemoMode) return demoAdminPlayer(playerId)
  const client = requireSupabase()
  const [playerResult, progressResult, questionsResult, mediaResult] = await Promise.all([
    client.from('players').select('id, profile_id, position, shirt_number, avatar_path, active, profiles!inner(login_name, first_name, last_name)').eq('id', playerId).single(),
    client.from('progress_entries').select('*, periods(name)').eq('player_id', playerId).order('created_at', { ascending: false }),
    client.from('player_questions').select('*, periods(name)').eq('player_id', playerId).order('sort_order'),
    client.from('player_media').select('*, periods(name)').eq('player_id', playerId).order('sort_order'),
  ])
  const error = playerResult.error ?? progressResult.error ?? questionsResult.error ?? mediaResult.error
  if (error) throw error
  const row = playerResult.data as LooseRow
  const profile = objectRelation(row.profiles)
  const progress = ((progressResult.data ?? []) as LooseRow[]).map(mapProgress)
  const avatarPath = row.avatar_path ? String(row.avatar_path) : null
  const urls = await signedAvatarUrls([avatarPath])
  return {
    id: String(row.id), profileId: String(row.profile_id), loginName: String(profile.login_name), firstName: String(profile.first_name), lastName: String(profile.last_name),
    position: row.position ? String(row.position) : null, shirtNumber: row.shirt_number == null ? null : Number(row.shirt_number), avatarPath,
    avatarUrl: avatarPath ? urls.get(avatarPath) ?? null : null, active: Boolean(row.active), totalPoints: progress.reduce((sum, item) => sum + item.points, 0),
    progress, questions: ((questionsResult.data ?? []) as LooseRow[]).map(mapQuestion), media: ((mediaResult.data ?? []) as LooseRow[]).map(mapMedia),
  }
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  if (isDemoMode) return demoAdminDashboard()
  const client = requireSupabase()
  const [periodResult, playerResult, progressResult] = await Promise.all([
    client.from('periods').select('*').eq('is_current', true).maybeSingle(),
    client.from('players').select('id', { count: 'exact', head: true }).eq('active', true),
    client.from('progress_entries').select('id, player_id, points, title, created_at, players!inner(profiles!inner(first_name, last_name))').order('created_at', { ascending: false }).limit(5),
  ])
  const error = periodResult.error ?? playerResult.error ?? progressResult.error
  if (error) throw error
  const recentProgress: RecentProgress[] = ((progressResult.data ?? []) as LooseRow[]).map((row) => {
    const player = objectRelation(row.players)
    const profile = objectRelation(player.profiles)
    return { id: String(row.id), playerId: String(row.player_id), playerName: `${profile.first_name} ${profile.last_name}`, points: Number(row.points), title: String(row.title), createdAt: String(row.created_at) }
  })
  return { currentPeriod: periodResult.data ? mapPeriod(periodResult.data as LooseRow) : null, activePlayers: playerResult.count ?? 0, recentProgress }
}

async function currentUserId() {
  const { data, error } = await requireSupabase().auth.getUser()
  if (error || !data.user) throw new Error('Log opnieuw in om deze wijziging op te slaan.')
  return data.user.id
}

export async function createPlayer(input: CreatePlayerInput) {
  if (isDemoMode) return demoCreatePlayer(input)
  const { data, error } = await requireSupabase().functions.invoke('admin-users', { body: { action: 'create_player', ...input } })
  if (error) throw new Error(getErrorMessage(data, error.message))
  if (data?.error) throw new Error(data.error)
  return data as { playerId: string; loginName: string; password: string }
}

export async function resetPlayerPassword(playerId: string) {
  if (isDemoMode) return demoResetPassword()
  const { data, error } = await requireSupabase().functions.invoke('admin-users', { body: { action: 'reset_password', playerId } })
  if (error) throw new Error(getErrorMessage(data, error.message))
  if (data?.error) throw new Error(data.error)
  return data as { password: string }
}

export async function setPlayerActive(playerId: string, active: boolean) {
  if (isDemoMode) return demoSetActive(playerId, active)
  const { data, error } = await requireSupabase().functions.invoke('admin-users', { body: { action: 'set_active', playerId, active } })
  if (error) throw new Error(getErrorMessage(data, error.message))
  if (data?.error) throw new Error(data.error)
}

export async function updatePlayerProfile(player: AdminPlayerRow, input: PlayerProfileInput) {
  if (isDemoMode) return demoUpdatePlayer(player.id, input)
  const client = requireSupabase()
  const { error: profileError } = await client.from('profiles').update({ first_name: input.firstName.trim(), last_name: input.lastName.trim() }).eq('id', player.profileId)
  if (profileError) throw profileError
  const { error } = await client.from('players').update({ position: input.position?.trim() || null, shirt_number: input.shirtNumber ?? null }).eq('id', player.id)
  if (error) throw error
}

export async function uploadPlayerAvatar(player: AdminPlayerRow, file: File) {
  if (isDemoMode) return
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${player.id}/avatar-${Date.now()}.${extension}`
  const client = requireSupabase()
  const { error: uploadError } = await client.storage.from('player-avatars').upload(path, file, { cacheControl: '3600' })
  if (uploadError) throw uploadError
  const { error: updateError } = await client.from('players').update({ avatar_path: path }).eq('id', player.id)
  if (updateError) {
    await client.storage.from('player-avatars').remove([path])
    throw updateError
  }
  if (player.avatarPath) await client.storage.from('player-avatars').remove([player.avatarPath])
}

export async function createPeriod(name: string) {
  if (isDemoMode) return demoCreatePeriod(name)
  const { data, error } = await requireSupabase().rpc('create_period_and_make_current', { period_name: name })
  if (error) throw error
  return mapPeriod(data as LooseRow)
}

export async function setCurrentPeriod(id: string) {
  if (isDemoMode) return demoSetPeriod(id)
  const { error } = await requireSupabase().rpc('set_current_period', { target_period_id: id })
  if (error) throw error
}

export async function renamePeriod(id: string, name: string) {
  if (isDemoMode) return demoRenamePeriod(id, name)
  const { error } = await requireSupabase().from('periods').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function deletePeriod(id: string) {
  if (isDemoMode) return demoDeletePeriod(id)
  const { error } = await requireSupabase().from('periods').delete().eq('id', id)
  if (error) throw error
}

export async function saveProgress(playerId: string, input: ProgressInput, id?: string) {
  if (isDemoMode) return demoSaveProgress(playerId, input, id)
  const client = requireSupabase()
  const payload = { player_id: playerId, period_id: input.periodId, points: input.points, title: input.title.trim(), description: input.description?.trim() || null }
  const query = id ? client.from('progress_entries').update(payload).eq('id', id) : client.from('progress_entries').insert({ ...payload, created_by: await currentUserId() })
  const { error } = await query
  if (error) throw error
}

export async function deleteProgress(id: string) {
  if (isDemoMode) return demoDeleteProgress(id)
  const { error } = await requireSupabase().from('progress_entries').delete().eq('id', id)
  if (error) throw error
}

export async function saveQuestion(playerId: string, input: QuestionInput, id?: string) {
  if (isDemoMode) return demoSaveQuestion(playerId, input, id)
  const client = requireSupabase()
  const payload = { player_id: playerId, period_id: input.periodId || null, question: input.question.trim(), answer: input.answer.trim(), category: input.category?.trim() || null, sort_order: input.sortOrder ?? 1 }
  const query = id ? client.from('player_questions').update(payload).eq('id', id) : client.from('player_questions').insert({ ...payload, created_by: await currentUserId() })
  const { error } = await query
  if (error) throw error
}

export async function deleteQuestion(id: string) {
  if (isDemoMode) return demoDeleteQuestion(id)
  const { error } = await requireSupabase().from('player_questions').delete().eq('id', id)
  if (error) throw error
}

export async function convertLearningItemToProgress(input: ConvertLearningItemInput) {
  if (isDemoMode) return demoConvertLearningItem(input)
  const { error } = await requireSupabase().rpc('convert_learning_item_to_progress', {
    learning_item_id: input.learningItemId,
    target_period_id: input.periodId,
    progress_points: input.points,
    progress_title: input.title.trim(),
    progress_description: input.description?.trim() || null,
  })
  if (error) throw error
}

export async function saveMedia(playerId: string, input: MediaInput, id?: string) {
  if (isDemoMode) return demoSaveMedia(playerId, input, id)
  const client = requireSupabase()
  const payload = { player_id: playerId, period_id: input.periodId || null, title: input.title.trim(), description: input.description?.trim() || null, url: input.url.trim(), media_type: getYouTubeId(input.url) ? 'youtube' : 'link', sort_order: input.sortOrder ?? 1 }
  const query = id ? client.from('player_media').update(payload).eq('id', id) : client.from('player_media').insert({ ...payload, created_by: await currentUserId() })
  const { error } = await query
  if (error) throw error
}

export async function deleteMedia(id: string) {
  if (isDemoMode) return demoDeleteMedia(id)
  const { error } = await requireSupabase().from('player_media').delete().eq('id', id)
  if (error) throw error
}
