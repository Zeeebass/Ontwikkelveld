import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import type { PlayerMedia } from '../types/app'
import { getYouTubeEmbedUrl, isSafeExternalUrl } from '../lib/youtube'

export function MediaCard({ item }: { item: PlayerMedia }) {
  const embedUrl = item.mediaType === 'youtube' ? getYouTubeEmbedUrl(item.url) : null
  const [videoState, setVideoState] = useState<'loading' | 'ready' | 'error'>('loading')
  return (
    <article className="media-item">
      {embedUrl ? (
        <div className={`media-item__embed media-item__embed--${videoState}`}>
          <div className="media-item__video-state" aria-live="polite">
            <span className="media-item__video-mark"><Play aria-hidden="true" /></span>
            <span>{videoState === 'error' ? 'Video niet geladen' : videoState === 'loading' ? 'Video wordt geladen' : 'Marpunten video'}</span>
          </div>
          <iframe
            src={embedUrl}
            title={item.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setVideoState('ready')}
            onError={() => setVideoState('error')}
          />
          <a className="media-item__youtube-link" href={item.url} target="_blank" rel="noreferrer noopener">
            Open op YouTube <ExternalLink aria-hidden="true" />
          </a>
        </div>
      ) : (
        <div className="media-item__placeholder" aria-hidden="true"><Play /></div>
      )}
      <div className="media-item__content">
        <div className="content-meta"><span>{item.periodName || 'Altijd relevant'}</span><span>{item.mediaType === 'youtube' ? 'Video' : 'Materiaal'}</span></div>
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {!embedUrl && isSafeExternalUrl(item.url) && <a className="text-button" href={item.url} target="_blank" rel="noreferrer noopener">Open materiaal <ExternalLink aria-hidden="true" /></a>}
      </div>
    </article>
  )
}
