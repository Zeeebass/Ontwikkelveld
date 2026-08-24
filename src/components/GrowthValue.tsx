import { formatGrowth, growthAriaLabel } from '../lib/format'

export function GrowthValue({ points, size = 'regular', detail = false }: { points: number; size?: 'small' | 'regular' | 'large'; detail?: boolean }) {
  return (
    <span className={`growth growth--${size}`} aria-label={growthAriaLabel(points)}>
      {formatGrowth(points, !detail)}
    </span>
  )
}
