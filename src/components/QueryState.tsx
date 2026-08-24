import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function LoadingState({ label = 'Gegevens laden…' }: { label?: string }) {
  return <div className="state-panel" role="status"><LoaderCircle className="spin" aria-hidden="true" /><p>{label}</p></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div><h2>Dat ging niet goed</h2><p>{message}</p></div>
      {onRetry && <button className="button button--secondary" type="button" onClick={onRetry}>Opnieuw proberen</button>}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="state-panel state-panel--empty">
      <Inbox aria-hidden="true" />
      <div><h2>{title}</h2><p>{description}</p></div>
      {action}
    </div>
  )
}
