import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GrowthValue } from '../components/GrowthValue'
import { PageHeader } from '../components/PageHeader'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { EmptyState, ErrorState, LoadingState } from '../components/QueryState'
import { useAuth } from '../context/AuthContext'
import { getTeamGrowth } from '../lib/api'

export function TeamPage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: ['team-growth'], queryFn: getTeamGrowth })
  if (query.isLoading) return <LoadingState label="Teamoverzicht opbouwen…" />
  if (query.error) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  const rows = query.data ?? []
  const periodName = rows[0]?.currentPeriodName
  return (
    <div className="page page--team">
      <PageHeader title="Team Groeiwaarde" description={periodName ? `${periodName} is nu actief.` : 'Er is nog geen huidige periode gekozen.'} />
      <section className="growth-board" aria-label="Groeiwaarde team">
        <header className="growth-board__header"><span>Speler</span><span>Deze periode</span><span>Totaal</span></header>
        {rows.length ? rows.map((player) => (
          <article className="player-growth-row" key={player.playerId}>
            <div className="player-growth-row__identity"><PlayerAvatar firstName={player.firstName} lastName={player.lastName} url={player.avatarUrl} /><div><h2>{player.firstName} {player.lastName}</h2><p>{player.shirtNumber ? `#${player.shirtNumber} · ` : ''}{player.position || 'Positie niet ingevuld'}</p></div></div>
            <div className="player-growth-row__value"><span>Deze periode</span><GrowthValue points={player.currentPoints} /></div>
            <div className="player-growth-row__value player-growth-row__value--total"><span>Totaal</span><GrowthValue points={player.totalPoints} /></div>
            {user?.role === 'admin' && <Link className="icon-button row-action" to={`/admin/players/${player.playerId}`} aria-label={`${player.firstName} beheren`}><ArrowUpRight /></Link>}
          </article>
        )) : <EmptyState title="Nog geen actieve spelers" description="Zodra de admin een speler toevoegt, verschijnt die hier automatisch." />}
      </section>
      <aside className="growth-explainer"><Info aria-hidden="true" /><p><strong>Groeiwaarde staat voor persoonlijke ontwikkeling en behaalde progressie.</strong> Het is geen spelersrating en zegt niets over wie de beste speler is.</p></aside>
    </div>
  )
}
