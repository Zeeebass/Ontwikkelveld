export const AUTH_DOMAIN = 'marpunten.invalid'

const firstWords = [
  'Anker', 'Balans', 'Coach', 'Dribbel', 'Focus', 'Keeper', 'Kompas', 'Lijn',
  'Pass', 'Pressie', 'Ritme', 'Scan', 'Sprint', 'Team', 'Tempo', 'Veld',
]

const secondWords = [
  'Arena', 'Brug', 'Cirkel', 'Doelpunt', 'Flank', 'Maan', 'Pion', 'Plan',
  'Richting', 'Ruimte', 'Schakel', 'Ster', 'Tactiek', 'Tunnel', 'Vleugel', 'Zone',
]

export function normalizeLoginName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '')
}

export function toAuthEmail(loginName: string) {
  return `${normalizeLoginName(loginName)}@${AUTH_DOMAIN}`
}

function secureIndex(max: number) {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % max
}

export function generateMemorablePassword() {
  const digits = String(secureIndex(10_000)).padStart(4, '0')
  return `${firstWords[secureIndex(firstWords.length)]}-${secondWords[secureIndex(secondWords.length)]}-${digits}`
}
