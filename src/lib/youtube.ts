const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'])

export function getYouTubeId(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    if (!youtubeHosts.has(url.hostname.toLowerCase())) return null
    if (url.hostname.toLowerCase().includes('youtu.be')) return validId(url.pathname.split('/').filter(Boolean)[0])
    if (url.pathname === '/watch') return validId(url.searchParams.get('v'))
    const parts = url.pathname.split('/').filter(Boolean)
    if (['embed', 'shorts', 'live'].includes(parts[0])) return validId(parts[1])
    return null
  } catch {
    return null
  }
}

function validId(value: string | null | undefined) {
  return value && /^[a-zA-Z0-9_-]{6,15}$/.test(value) ? value : null
}

export function getYouTubeEmbedUrl(rawUrl: string) {
  const id = getYouTubeId(rawUrl)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

export function isSafeExternalUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
