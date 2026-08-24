import { describe, expect, it } from 'vitest'
import { generateMemorablePassword } from '../../supabase/functions/_shared/credentials'

describe('admin-wachtwoordgenerator', () => {
  it('genereert een lange memorabele code met woorden, scheidingstekens en vier cijfers', () => {
    const password = generateMemorablePassword()
    expect(password.length).toBeGreaterThanOrEqual(12)
    expect(password).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-\d{4}$/)
  })

  it('gebruikt cryptografische variatie tussen codes', () => {
    expect(new Set(Array.from({ length: 12 }, () => generateMemorablePassword())).size).toBeGreaterThan(1)
  })
})
