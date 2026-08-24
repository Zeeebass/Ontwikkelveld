export type AppRole = 'admin' | 'player'
export type MediaType = 'youtube' | 'link'

export type UserContext = {
  role: AppRole
  playerId: string | null
  fullName: string
  active: boolean
}

export type Period = {
  id: string
  name: string
  sortOrder: number
  isCurrent: boolean
  createdAt?: string
}

export type TeamGrowthRow = {
  currentPeriodId: string | null
  currentPeriodName: string | null
  playerId: string
  firstName: string
  lastName: string
  position: string | null
  shirtNumber: number | null
  avatarPath: string | null
  avatarUrl: string | null
  currentPoints: number
  totalPoints: number
}

export type ProgressEntry = {
  id: string
  playerId: string
  periodId: string
  periodName: string
  points: number
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type PlayerQuestion = {
  id: string
  playerId: string
  periodId: string | null
  periodName: string | null
  question: string
  answer: string
  category: string | null
  sortOrder: number
  createdAt: string
}

export type PlayerMedia = {
  id: string
  playerId: string
  periodId: string | null
  periodName: string | null
  title: string
  description: string | null
  url: string
  mediaType: MediaType
  sortOrder: number
  createdAt: string
}

export type MyDashboardData = {
  context: UserContext
  progress: ProgressEntry[]
  questions: PlayerQuestion[]
  media: PlayerMedia[]
  totalPoints: number
  currentPoints: number
  currentPeriod: Period | null
}

export type AdminPlayerRow = {
  id: string
  profileId: string
  loginName: string
  firstName: string
  lastName: string
  position: string | null
  shirtNumber: number | null
  avatarPath: string | null
  avatarUrl: string | null
  active: boolean
  totalPoints: number
}

export type AdminPlayerDetail = AdminPlayerRow & {
  progress: ProgressEntry[]
  questions: PlayerQuestion[]
  media: PlayerMedia[]
}

export type RecentProgress = {
  id: string
  playerId: string
  playerName: string
  points: number
  title: string
  createdAt: string
}

export type AdminDashboardData = {
  currentPeriod: Period | null
  activePlayers: number
  recentProgress: RecentProgress[]
}

export type PlayerProfileInput = {
  firstName: string
  lastName: string
  position?: string | null
  shirtNumber?: number | null
}

export type CreatePlayerInput = PlayerProfileInput & { loginName: string }
export type ProgressInput = { periodId: string; points: number; title: string; description?: string | null }
export type QuestionInput = { periodId?: string | null; question: string; answer: string; category?: string | null; sortOrder?: number }
export type ConvertLearningItemInput = ProgressInput & { learningItemId: string }
export type MediaInput = { periodId?: string | null; title: string; description?: string | null; url: string; mediaType: MediaType; sortOrder?: number }
