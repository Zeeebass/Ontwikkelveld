import { describe, expect, it } from 'vitest'
import { getYouTubeEmbedUrl, getYouTubeId, isSafeExternalUrl } from './youtube'

describe('media URL-validatie', () => {
  it('herkent gangbare YouTube-links', () => {
    expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('gebruikt de privacyvriendelijke embed-host', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('embedt geen lookalike-host en blokkeert onveilige protocollen', () => {
    expect(getYouTubeId('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('https://example.com/video')).toBe(true)
  })
})
