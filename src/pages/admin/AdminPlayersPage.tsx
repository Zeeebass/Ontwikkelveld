import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Plus, Search, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { GrowthValue } from '../../components/GrowthValue'
import { PageHeader } from '../../components/PageHeader'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryState'
import { createPlayer, getAdminPlayers } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import { isValidLoginName, normalizeLoginName } from '../../lib/credentials'

const optionalNumber = z.number().int().min(1, 'Minimaal 1.').max(99, 'Maximaal 99.').optional()
const schema = z.object({
  firstName: z.string().trim().min(1, 'Voornaam is verplicht.').max(80),
  lastName: z.string().trim().min(1, 'Achternaam is verplicht.').max(120),
  loginName: z.string().trim().refine(isValidLoginName, 'Gebruik 3–32 letters, cijfers, punten of streepjes.'),
  position: z.string().trim().max(40).optional(),
  shirtNumber: optionalNumber,
})
type FormValues = z.infer<typeof schema>
type Credentials = { loginName: string; password: string }

export function AdminPlayersPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(params.get('new') === '1')
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-players'], queryFn: getAdminPlayers })
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const mutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: (result) => {
      setCredentials({ loginName: result.loginName, password: result.password })
      reset()
      void queryClient.invalidateQueries({ queryKey: ['admin-players'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['team-growth'] })
    },
  })

  const showCreate = createOpen || params.get('new') === '1'
  const closeCreate = () => { setCreateOpen(false); setCredentials(null); setParams({}, { replace: true }) }
  const filtered = useMemo(() => (query.data ?? []).filter((player) => `${player.firstName} ${player.lastName} ${player.loginName}`.toLowerCase().includes(search.toLowerCase())), [query.data, search])
  const copyCredentials = async () => {
    if (!credentials) return
    await navigator.clipboard.writeText(`Loginnaam: ${credentials.loginName}\nWachtwoord: ${credentials.password}`)
    setCopied(true); window.setTimeout(() => setCopied(false), 1800)
  }

  if (query.isLoading) return <LoadingState label="Spelers laden…" />
  if (query.error) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  return (
    <div className="page page--players">
      <PageHeader title="Spelers" description="Accounts, profielen en persoonlijke ontwikkeling beheren." actions={<button className="button button--primary" type="button" onClick={() => setCreateOpen(true)}><Plus /> Speler toevoegen</button>} />
      <div className="toolbar"><label className="search-field"><Search aria-hidden="true" /><span className="sr-only">Zoek speler</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek op naam of loginnaam" /></label><span>{filtered.length} {filtered.length === 1 ? 'speler' : 'spelers'}</span></div>

      {showCreate && <section className="editor-panel editor-panel--create">
        <header><div><h2>Nieuwe speler</h2><p>Na opslaan verschijnt de eenmalige inlogcode.</p></div><button type="button" className="icon-button" onClick={closeCreate} aria-label="Formulier sluiten"><X /></button></header>
        {credentials ? <div className="credentials" aria-live="polite"><ShieldCheck aria-hidden="true" /><div><h3>Account is klaar</h3><p>Deel deze gegevens veilig met de speler. Het wachtwoord wordt hierna niet opnieuw getoond.</p><dl><div><dt>Loginnaam</dt><dd>{credentials.loginName}</dd></div><div><dt>Wachtwoord</dt><dd>{credentials.password}</dd></div></dl><div className="button-row"><button type="button" className="button button--primary" onClick={() => void copyCredentials()}>{copied ? <Check /> : <Copy />}{copied ? 'Gekopieerd' : 'Gegevens kopiëren'}</button><button type="button" className="button button--secondary" onClick={closeCreate}>Klaar</button></div></div></div> : <form className="form-grid" onSubmit={handleSubmit((values) => mutation.mutate({ ...values, loginName: normalizeLoginName(values.loginName), position: values.position || null, shirtNumber: values.shirtNumber ?? null }))} noValidate>
          <label className="field-label">Voornaam<input {...register('firstName')} />{errors.firstName && <span className="field-error">{errors.firstName.message}</span>}</label>
          <label className="field-label">Achternaam<input {...register('lastName')} />{errors.lastName && <span className="field-error">{errors.lastName.message}</span>}</label>
          <label className="field-label">Loginnaam<input autoCapitalize="none" {...register('loginName')} onBlur={(event) => setValue('loginName', normalizeLoginName(event.target.value))} placeholder="bijv. daan8" />{errors.loginName && <span className="field-error">{errors.loginName.message}</span>}</label>
          <label className="field-label">Positie<input {...register('position')} placeholder="bijv. Middenvelder" /></label>
          <label className="field-label">Rugnummer<input type="number" min="1" max="99" {...register('shirtNumber', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label>
          {mutation.error && <div className="notice notice--error form-grid__wide" role="alert">{getErrorMessage(mutation.error)}</div>}
          <div className="button-row form-grid__wide"><button className="button button--primary" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Account maken…' : 'Speler en account maken'}</button><button className="button button--secondary" type="button" onClick={closeCreate}>Annuleren</button></div>
        </form>}
      </section>}

      {filtered.length ? <section className="player-admin-list" aria-label="Spelerslijst"><header><span>Speler</span><span>Login</span><span>Groeiwaarde</span><span>Status</span><span /></header>{filtered.map((player) => <article key={player.id}><div className="player-cell"><PlayerAvatar firstName={player.firstName} lastName={player.lastName} url={player.avatarUrl} size="small" /><span><strong>{player.firstName} {player.lastName}</strong><small>{player.shirtNumber ? `#${player.shirtNumber} · ` : ''}{player.position || 'Geen positie'}</small></span></div><code>{player.loginName}</code><GrowthValue points={player.totalPoints} size="small" /><span className={`status ${player.active ? 'status--active' : 'status--inactive'}`}>{player.active ? 'Actief' : 'Inactief'}</span><Link className="button button--secondary button--small" to={`/admin/players/${player.id}`}>Beheren</Link></article>)}</section> : <EmptyState title="Geen spelers gevonden" description="Pas je zoekopdracht aan of voeg een nieuwe speler toe." />}
    </div>
  )
}
