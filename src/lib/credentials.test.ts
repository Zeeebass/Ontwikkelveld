import { describe, expect, it } from 'vitest'
import { isValidLoginName, normalizeLoginName, toAuthEmail } from './credentials'

describe('loginnaam', () => {
  it('normaliseert spaties, hoofdletters en onveilige tekens', () => {
    expect(normalizeLoginName('  Daan 8! ')).toBe('daan-8')
  })

  it('maakt het technische auth-adres deterministisch', () => {
    expect(toAuthEmail('Daan8')).toBe('daan8@marpunten.invalid')
  })

  it('weigert te korte of verkeerd beginnende namen', () => {
    expect(isValidLoginName('da')).toBe(false)
    expect(isValidLoginName('-daan')).toBe(false)
    expect(isValidLoginName('daan_8')).toBe(true)
  })
})
