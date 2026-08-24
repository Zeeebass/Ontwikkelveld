import { useQuery } from '@tanstack/react-query'
import { BookOpenCheck, Film, TrendingUp } from 'lucide-react'
import { GrowthValue } from '../components/GrowthValue'
import { MediaCard } from '../components/MediaCard'
import { PageHeader } from '../components/PageHeader'
import { LearningItemCard } from '../components/LearningItemCard'
import { EmptyState, ErrorState, LoadingState } from '../components/QueryState'
import { getMyDashboard } from '../lib/api'
import { formatDate } from '../lib/format'

export function MyDashboardPage() {
  const query = useQuery({ queryKey: ['my-dashboard'], queryFn: getMyDashboard })
  if (query.isLoading) return <LoadingState label="Jouw persoonlijke omgeving laden…" />
  if (query.error) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  const data = query.data!
  return (
    <div className="page page--personal">
      <PageHeader title={`Mijn groei, ${data.context.fullName.split(' ')[0]}`} description="Jouw aandachtspunten, ontwikkeling en materiaal op één plek." />
      <section className="personal-scoreboard">
        <div className="personal-scoreboard__main"><span>Totale Groeiwaarde</span><GrowthValue points={data.totalPoints} size="large" /></div>
        <div className="personal-scoreboard__period"><span>{data.currentPeriod?.name || 'Geen huidige periode'}</span><GrowthValue points={data.currentPoints} size="regular" /><small>deze periode</small></div>
        <div className="personal-scoreboard__line" aria-hidden="true" />
      </section>

      <section className="content-section" id="progressie">
        <div className="section-heading"><TrendingUp aria-hidden="true" /><div><h2>Mijn progressie</h2><p>Alle momenten die samen jouw Groeiwaarde vormen.</p></div></div>
        {data.progress.length ? <div className="timeline">{data.progress.map((item) => <article className="timeline__item" key={item.id}><div className="timeline__point" /><div className="timeline__date">{formatDate(item.createdAt)}</div><div className="timeline__content"><div><h3>{item.title}</h3><p>{item.periodName}</p>{item.description && <p className="timeline__description">{item.description}</p>}</div><GrowthValue points={item.points} size="small" /></div></article>)}</div> : <EmptyState title="Nog geen progressie toegevoegd" description="Je trainer kan hier behaalde ontwikkelmomenten toevoegen." />}
      </section>

      <section className="content-section" id="leeritems">
        <div className="section-heading"><BookOpenCheck aria-hidden="true" /><div><h2>Mijn leeritems</h2><p>Jouw aandachtspunten met de toelichting van je trainer.</p></div></div>
        {data.questions.length ? <div className="learning-item-list">{data.questions.map((item) => <LearningItemCard key={item.id} item={item} />)}</div> : <EmptyState title="Nog geen leeritems" description="Nieuwe persoonlijke aandachtspunten verschijnen hier." />}
      </section>

      <section className="content-section" id="media">
        <div className="section-heading"><Film aria-hidden="true" /><div><h2>Mijn materiaal</h2><p>Video's en links die je trainer voor jou heeft geselecteerd.</p></div></div>
        {data.media.length ? <div className="media-list">{data.media.map((item) => <MediaCard key={item.id} item={item} />)}</div> : <EmptyState title="Nog geen materiaal" description="Persoonlijke video's en links verschijnen hier zodra ze zijn toegevoegd." />}
      </section>
    </div>
  )
}
