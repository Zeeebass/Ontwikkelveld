export function PlayerAvatar({ firstName, lastName, url, size = 'regular' }: { firstName: string; lastName: string; url?: string | null; size?: 'small' | 'regular' | 'large' }) {
  const initials = `${firstName.at(0) ?? ''}${lastName.at(0) ?? ''}`.toUpperCase()
  return url ? (
    <img className={`avatar avatar--${size}`} src={url} alt={`${firstName} ${lastName}`} />
  ) : (
    <span className={`avatar avatar--${size} avatar--initials`} aria-label={`${firstName} ${lastName}`}>{initials}</span>
  )
}
