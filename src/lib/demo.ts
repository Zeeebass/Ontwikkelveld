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
  TeamGrowthRow,
  UserContext,
} from '../types/app'
import { getYouTubeId } from './youtube'

const now = '2026-08-24T09:00:00.000Z'
const ids = {
  p1: '10000000-0000-4000-8000-000000000001',
  p2: '10000000-0000-4000-8000-000000000002',
  p3: '10000000-0000-4000-8000-000000000003',
  p4: '10000000-0000-4000-8000-000000000004',
  period1: '20000000-0000-4000-8000-000000000001',
  period2: '20000000-0000-4000-8000-000000000002',
  period3: '20000000-0000-4000-8000-000000000003',
}

let periods: Period[] = [
  { id: ids.period1, name: 'Periode 1', sortOrder: 1, isCurrent: false },
  { id: ids.period2, name: 'Periode 2', sortOrder: 2, isCurrent: false },
  { id: ids.period3, name: 'Periode 3', sortOrder: 3, isCurrent: true },
]

let players: AdminPlayerRow[] = [
  { id: ids.p1, profileId: '30000000-0000-4000-8000-000000000001', loginName: 'daan8', firstName: 'Daan', lastName: 'de Jong', position: 'Middenvelder', shirtNumber: 8, avatarPath: null, avatarUrl: null, active: true, totalPoints: 450 },
  { id: ids.p2, profileId: '30000000-0000-4000-8000-000000000002', loginName: 'sem11', firstName: 'Sem', lastName: 'Vos', position: 'Rechtsbuiten', shirtNumber: 11, avatarPath: null, avatarUrl: null, active: true, totalPoints: 500 },
  { id: ids.p3, profileId: '30000000-0000-4000-8000-000000000003', loginName: 'noah4', firstName: 'Noah', lastName: 'Smit', position: 'Centrale verdediger', shirtNumber: 4, avatarPath: null, avatarUrl: null, active: true, totalPoints: 300 },
  { id: ids.p4, profileId: '30000000-0000-4000-8000-000000000004', loginName: 'luuk1', firstName: 'Luuk', lastName: 'Bakker', position: 'Keeper', shirtNumber: 1, avatarPath: null, avatarUrl: null, active: false, totalPoints: 400 },
]

let progress: ProgressEntry[] = [
  { id: '40000000-0000-4000-8000-000000000001', playerId: ids.p1, periodId: ids.period1, periodName: 'Periode 1', points: 150, title: 'Open draaien', description: 'Vaker met het speelveld voor je aannemen.', createdAt: '2026-06-12T10:00:00Z', updatedAt: '2026-06-12T10:00:00Z' },
  { id: '40000000-0000-4000-8000-000000000002', playerId: ids.p1, periodId: ids.period2, periodName: 'Periode 2', points: 200, title: 'Coaching voor de bal', description: 'Eerder informatie geven aan de speler aan de bal.', createdAt: '2026-07-14T10:00:00Z', updatedAt: '2026-07-14T10:00:00Z' },
  { id: '40000000-0000-4000-8000-000000000003', playerId: ids.p1, periodId: ids.period3, periodName: 'Periode 3', points: 100, title: 'Scannen voor balaanname', description: 'Doelstelling tijdens partijvorm gehaald.', createdAt: now, updatedAt: now },
  { id: '40000000-0000-4000-8000-000000000004', playerId: ids.p2, periodId: ids.period3, periodName: 'Periode 3', points: 200, title: 'Actie naar binnen', description: null, createdAt: '2026-08-23T11:00:00Z', updatedAt: '2026-08-23T11:00:00Z' },
  { id: '40000000-0000-4000-8000-000000000005', playerId: ids.p3, periodId: ids.period3, periodName: 'Periode 3', points: 100, title: 'Doordekken', description: null, createdAt: '2026-08-22T11:00:00Z', updatedAt: '2026-08-22T11:00:00Z' },
]

let questions: PlayerQuestion[] = [
  { id: '50000000-0000-4000-8000-000000000001', playerId: ids.p1, periodId: ids.period3, periodName: 'Periode 3', question: 'Waar kijk je voordat je de bal ontvangt?', answer: 'Kijk vóór de balaanname over beide schouders, zodat je volgende actie al duidelijk is.', category: 'Tactisch', sortOrder: 1, createdAt: now },
  { id: '50000000-0000-4000-8000-000000000002', playerId: ids.p1, periodId: null, periodName: null, question: 'Wat is jouw eerste taak bij balverlies?', answer: 'Direct de kortste passlijn naar binnen afsluiten en daarna druk zetten.', category: 'Omschakeling', sortOrder: 2, createdAt: now },
]

let media: PlayerMedia[] = [
  { id: '60000000-0000-4000-8000-000000000001', playerId: ids.p1, periodId: ids.period3, periodName: 'Periode 3', title: 'Scannen voor balaanname', description: 'Let op het kijkgedrag vóórdat de pass wordt gespeeld.', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', mediaType: 'youtube', sortOrder: 1, createdAt: now },
  { id: '60000000-0000-4000-8000-000000000002', playerId: ids.p1, periodId: null, periodName: null, title: 'Persoonlijke wedstrijdnotities', description: 'Open het gedeelde materiaal voor de volgende training.', url: 'https://example.com', mediaType: 'link', sortOrder: 2, createdAt: now },
]

export function demoContext(loginName = localStorage.getItem('marpunten-demo-user') ?? 'coach'): UserContext {
  if (loginName === 'coach') return { role: 'admin', playerId: null, fullName: 'Coach Ontwikkelveld', active: true }
  return { role: 'player', playerId: ids.p1, fullName: 'Daan de Jong', active: true }
}

export function demoTeamGrowth(): TeamGrowthRow[] {
  const current = periods.find((period) => period.isCurrent) ?? null
  return players
    .filter((player) => player.active)
    .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999) || a.lastName.localeCompare(b.lastName, 'nl'))
    .map((player) => ({
      currentPeriodId: current?.id ?? null,
      currentPeriodName: current?.name ?? null,
      playerId: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position,
      shirtNumber: player.shirtNumber,
      avatarPath: player.avatarPath,
      avatarUrl: player.avatarUrl,
      currentPoints: current ? progress.filter((item) => item.playerId === player.id && item.periodId === current.id).reduce((sum, item) => sum + item.points, 0) : 0,
      totalPoints: progress.filter((item) => item.playerId === player.id).reduce((sum, item) => sum + item.points, 0) || player.totalPoints,
    }))
}

export function demoMyDashboard(): MyDashboardData {
  const context = demoContext('daan8')
  const ownProgress = progress.filter((item) => item.playerId === ids.p1)
  const currentPeriod = periods.find((period) => period.isCurrent) ?? null
  return {
    context,
    progress: ownProgress,
    questions: questions.filter((item) => item.playerId === ids.p1),
    media: media.filter((item) => item.playerId === ids.p1),
    totalPoints: ownProgress.reduce((sum, item) => sum + item.points, 0),
    currentPoints: ownProgress.filter((item) => item.periodId === currentPeriod?.id).reduce((sum, item) => sum + item.points, 0),
    currentPeriod,
  }
}

export function demoAdminPlayers() {
  return players
    .map((player) => ({ ...player, totalPoints: progress.filter((item) => item.playerId === player.id).reduce((sum, item) => sum + item.points, 0) }))
    .sort((a, b) => Number(b.active) - Number(a.active) || (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999))
}

export function demoAdminPlayer(playerId: string): AdminPlayerDetail {
  const player = players.find((item) => item.id === playerId)
  if (!player) throw new Error('Speler niet gevonden.')
  const playerProgress = progress.filter((item) => item.playerId === playerId)
  return { ...player, totalPoints: playerProgress.reduce((sum, item) => sum + item.points, 0), progress: playerProgress, questions: questions.filter((item) => item.playerId === playerId), media: media.filter((item) => item.playerId === playerId) }
}

export function demoAdminDashboard(): AdminDashboardData {
  return {
    currentPeriod: periods.find((period) => period.isCurrent) ?? null,
    activePlayers: players.filter((player) => player.active).length,
    recentProgress: [...progress].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((item) => {
      const player = players.find((row) => row.id === item.playerId)!
      return { id: item.id, playerId: item.playerId, playerName: `${player.firstName} ${player.lastName}`, points: item.points, title: item.title, createdAt: item.createdAt }
    }),
  }
}

export function demoPeriods() { return [...periods].sort((a, b) => a.sortOrder - b.sortOrder) }

export function demoCreatePlayer(input: CreatePlayerInput) {
  if (players.some((player) => player.loginName === input.loginName)) throw new Error('Deze loginnaam bestaat al.')
  const id = crypto.randomUUID()
  players.push({ id, profileId: crypto.randomUUID(), loginName: input.loginName, firstName: input.firstName, lastName: input.lastName, position: input.position ?? null, shirtNumber: input.shirtNumber ?? null, avatarPath: null, avatarUrl: null, active: true, totalPoints: 0 })
  return { playerId: id, loginName: input.loginName, password: 'Focus-Ruimte-4827' }
}

export function demoUpdatePlayer(id: string, input: PlayerProfileInput) {
  players = players.map((player) => player.id === id ? { ...player, ...input, position: input.position ?? null, shirtNumber: input.shirtNumber ?? null } : player)
}

export function demoSetActive(id: string, active: boolean) { players = players.map((player) => player.id === id ? { ...player, active } : player) }
export function demoResetPassword() { return { password: 'Scan-Tactiek-7351' } }

export function demoCreatePeriod(name: string) {
  periods = periods.map((period) => ({ ...period, isCurrent: false }))
  const period = { id: crypto.randomUUID(), name, sortOrder: periods.length + 1, isCurrent: true }
  periods.push(period)
  return period
}

export function demoSetPeriod(id: string) { periods = periods.map((period) => ({ ...period, isCurrent: period.id === id })) }
export function demoRenamePeriod(id: string, name: string) { periods = periods.map((period) => period.id === id ? { ...period, name } : period) }
export function demoDeletePeriod(id: string) {
  const period = periods.find((item) => item.id === id)
  if (period?.isCurrent) throw new Error('De huidige periode kan niet worden verwijderd.')
  if ([...progress, ...questions, ...media].some((item) => item.periodId === id)) throw new Error('Deze periode bevat nog gekoppelde content.')
  periods = periods.filter((item) => item.id !== id)
}

export function demoSaveProgress(playerId: string, input: ProgressInput, id?: string) {
  const period = periods.find((item) => item.id === input.periodId)!
  if (id) progress = progress.map((item) => item.id === id ? { ...item, ...input, periodName: period.name, description: input.description ?? null, updatedAt: new Date().toISOString() } : item)
  else progress.push({ id: crypto.randomUUID(), playerId, ...input, periodName: period.name, description: input.description ?? null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
}

export function demoDeleteProgress(id: string) { progress = progress.filter((item) => item.id !== id) }
export function demoSaveQuestion(playerId: string, input: QuestionInput, id?: string) {
  const periodName = periods.find((item) => item.id === input.periodId)?.name ?? null
  if (id) questions = questions.map((item) => item.id === id ? { ...item, ...input, periodId: input.periodId ?? null, periodName, category: input.category ?? null, sortOrder: input.sortOrder ?? 1 } : item)
  else questions.push({ id: crypto.randomUUID(), playerId, ...input, periodId: input.periodId ?? null, periodName, category: input.category ?? null, sortOrder: input.sortOrder ?? 1, createdAt: new Date().toISOString() })
}
export function demoDeleteQuestion(id: string) { questions = questions.filter((item) => item.id !== id) }
export function demoConvertLearningItem(input: ConvertLearningItemInput) {
  const { learningItemId, ...progressInput } = input
  const learningItem = questions.find((item) => item.id === learningItemId)
  if (!learningItem) throw new Error('Dit leeritem bestaat niet meer.')
  demoSaveProgress(learningItem.playerId, progressInput)
  questions = questions.filter((item) => item.id !== learningItemId)
}
export function demoSaveMedia(playerId: string, input: MediaInput, id?: string) {
  const periodName = periods.find((item) => item.id === input.periodId)?.name ?? null
  const mediaType = getYouTubeId(input.url) ? 'youtube' : 'link'
  if (id) media = media.map((item) => item.id === id ? { ...item, ...input, mediaType, periodId: input.periodId ?? null, periodName, description: input.description ?? null, sortOrder: input.sortOrder ?? 1 } : item)
  else media.push({ id: crypto.randomUUID(), playerId, ...input, mediaType, periodId: input.periodId ?? null, periodName, description: input.description ?? null, sortOrder: input.sortOrder ?? 1, createdAt: new Date().toISOString() })
}
export function demoDeleteMedia(id: string) { media = media.filter((item) => item.id !== id) }
