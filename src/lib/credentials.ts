export const AUTH_DOMAIN = 'marpunten.invalid'

export function normalizeLoginName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '')
}

export function toAuthEmail(loginName: string) {
  return `${normalizeLoginName(loginName)}@${AUTH_DOMAIN}`
}

export function isValidLoginName(value: string) {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(normalizeLoginName(value))
}
