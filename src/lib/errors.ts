export function getErrorMessage(error: unknown, fallback = 'Er ging iets mis. Probeer het opnieuw.') {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') return error.message
  return fallback
}
