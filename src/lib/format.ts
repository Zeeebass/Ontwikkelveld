export function formatGrowth(points: number, compact = true) {
  const sign = points > 0 ? '+' : points < 0 ? '−' : ''
  const absoluteEuro = Math.abs(points) * 1_000
  if (compact) {
    if (absoluteEuro >= 1_000_000) {
      const millions = absoluteEuro / 1_000_000
      return `${sign}€${new Intl.NumberFormat('nl-NL', { maximumFractionDigits: millions < 10 ? 1 : 0 }).format(millions)}M`
    }
    return `${sign}€${Math.round(absoluteEuro / 1_000)}K`
  }
  return `${sign}€${new Intl.NumberFormat('nl-NL').format(absoluteEuro)}`
}

export function growthAriaLabel(points: number) {
  const direction = points > 0 ? 'plus' : points < 0 ? 'min' : ''
  return `${direction} ${new Intl.NumberFormat('nl-NL').format(Math.abs(points) * 1_000)} euro Groeiwaarde`.trim()
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

export function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim()
}
