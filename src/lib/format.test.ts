import { describe, expect, it } from 'vitest'
import { formatGrowth, growthAriaLabel } from './format'

describe('Groeiwaarde', () => {
  it('vertaalt punten naar de gekozen FIFA-eurowaarde', () => {
    expect(formatGrowth(100)).toBe('+€100K')
    expect(formatGrowth(450, false)).toBe('+€450.000')
  })

  it('formatteert miljoenen compact in het Nederlands', () => {
    expect(formatGrowth(1_250)).toBe('+€1,3M')
  })

  it('heeft een volledige toegankelijke uitspraak', () => {
    expect(growthAriaLabel(100)).toBe('plus 100.000 euro Groeiwaarde')
  })
})
