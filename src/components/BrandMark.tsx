export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="Ontwikkelveld">
      <svg className="brand__mark" viewBox="0 0 42 42" aria-hidden="true">
        <rect x="3" y="3" width="36" height="36" rx="7" />
        <path d="M21 4v34M4 21h34M21 15a6 6 0 1 0 0 12M11 8v26M31 8v26" />
      </svg>
      {!compact && <span className="brand__word">Ontwikkelveld</span>}
    </span>
  )
}
