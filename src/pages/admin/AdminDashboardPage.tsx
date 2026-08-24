import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarRange, Plus, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GrowthValue } from '../../components/GrowthValue'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryState'
import { getAdminDashboard } from '../../lib/api'
import { formatDate } from '../../lib/format'

export function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboard })
  if (query.isLoading) return <LoadingState label="Adminoverzicht laden…" />
  if (query.error) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  const data = query.data!
  return (
    <div className="page page--admin-home">
      <PageHeader title="Coachoverzicht" description="Alles wat vandaag aandacht nodig heeft, zonder omwegen." actions={<Link className="button button--primary" to="/admin/players?new=1"><Plus aria-hidden="true" /> Speler toevoegen</Link>} />
      <section className="admin-status-strip">
        <div><CalendarRange aria-hidden="true" /><span>Huidige periode</span><strong>{data.currentPeriod?.name || 'Nog niet ingesteld'}</strong><Link to="/admin/periods">Beheren <ArrowRight /></Link></div>
        <div><UsersRound aria-hidden="true" /><span>Actieve spelers</span><strong>{data.activePlayers}</strong><Link to="/admin/players">Alle spelers <ArrowRight /></Link></div>
      </section>
      <section className="admin-recent">
        <div className="section-heading section-heading--plain"><div><h2>Recente progressie</h2><p>De nieuwste ontwikkelmomenten binnen het team.</p></div></div>
        {data.recentProgress.length ? <div className="data-list">{data.recentProgress.map((item) => (
          <Link className="data-list__row" to={`/admin/players/${item.playerId}`} key={item.id}>
            <span className="data-list__date">{formatDate(item.createdAt)}</span>
            <span><strong>{item.playerName}</strong><small>{item.title}</small></span>
            <GrowthValue points={item.points} size="small" /><ArrowRight aria-hidden="true" />
          </Link>
        ))}</div> : <EmptyState title="Nog geen progressie" description="Voeg bij een speler het eerste ontwikkelmoment toe." action={<Link className="button button--secondary" to="/admin/players">Open spelers</Link>} />}
      </section>
    </div>
  )
}
