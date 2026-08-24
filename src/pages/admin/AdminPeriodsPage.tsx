import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryState'
import { createPeriod, deletePeriod, getPeriods, renamePeriod, setCurrentPeriod } from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'

const schema = z.object({ name: z.string().trim().min(1, 'Vul een periodenaam in.').max(80) })
type FormValues = z.infer<typeof schema>

export function AdminPeriodsPage() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['periods'], queryFn: getPeriods })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ['periods'] }); void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }); void queryClient.invalidateQueries({ queryKey: ['team-growth'] }) }
  const createMutation = useMutation({ mutationFn: (name: string) => createPeriod(name), onSuccess: () => { reset(); setActionError(null); refresh() }, onError: (error) => setActionError(getErrorMessage(error)) })
  const actionMutation = useMutation({ mutationFn: async ({ action, id, name }: { action: 'current' | 'rename' | 'delete'; id: string; name?: string }) => {
    if (action === 'current') await setCurrentPeriod(id)
    if (action === 'rename') await renamePeriod(id, name ?? '')
    if (action === 'delete') await deletePeriod(id)
  }, onSuccess: () => { setEditingId(null); setActionError(null); refresh() }, onError: (error) => setActionError(getErrorMessage(error)) })
  if (query.isLoading) return <LoadingState label="Perioden laden…" />
  if (query.error) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  return (
    <div className="page page--periods">
      <PageHeader title="Perioden" description="Werk in vrije blokken zonder datums of vergrendeling." />
      <section className="period-create"><h2>Nieuwe periode starten</h2><p>De nieuwe periode wordt meteen de huidige. Bestaande resultaten blijven bewerkbaar.</p><form onSubmit={handleSubmit(({ name }) => createMutation.mutate(name))}><label className="field-label"><span className="sr-only">Naam nieuwe periode</span><input {...register('name')} placeholder="Bijv. Competitieblok 2" />{errors.name && <span className="field-error">{errors.name.message}</span>}</label><button className="button button--primary" disabled={createMutation.isPending}><Plus /> {createMutation.isPending ? 'Starten…' : 'Start periode'}</button></form></section>
      {actionError && <div className="notice notice--error" role="alert">{actionError}</div>}
      {(query.data ?? []).length ? <section className="period-list"><header><span>Volgorde</span><span>Naam</span><span>Status</span><span>Acties</span></header>{query.data!.map((period) => <article key={period.id}><span className="period-order">{String(period.sortOrder).padStart(2, '0')}</span>{editingId === period.id ? <label className="inline-edit"><span className="sr-only">Periodenaam</span><input value={editingName} onChange={(event) => setEditingName(event.target.value)} autoFocus /></label> : <strong>{period.name}</strong>}<span className={`status ${period.isCurrent ? 'status--current' : ''}`}>{period.isCurrent ? 'Huidig' : 'Ouder'}</span><div className="row-actions">{editingId === period.id ? <><button className="icon-button" type="button" onClick={() => actionMutation.mutate({ action: 'rename', id: period.id, name: editingName })} aria-label="Naam opslaan"><Check /></button><button className="icon-button" type="button" onClick={() => setEditingId(null)} aria-label="Bewerken annuleren"><X /></button></> : <><button className="icon-button" type="button" onClick={() => { setEditingId(period.id); setEditingName(period.name) }} aria-label={`${period.name} hernoemen`}><Pencil /></button>{!period.isCurrent && <button className="button button--secondary button--small" type="button" onClick={() => actionMutation.mutate({ action: 'current', id: period.id })}>Maak huidig</button>}<button className="icon-button icon-button--danger" type="button" disabled={period.isCurrent} onClick={() => { if (window.confirm(`Periode “${period.name}” verwijderen?`)) actionMutation.mutate({ action: 'delete', id: period.id }) }} aria-label={`${period.name} verwijderen`}><Trash2 /></button></>}</div></article>)}</section> : <EmptyState title="Nog geen perioden" description="Start de eerste periode om progressie te kunnen toevoegen." />}
    </div>
  )
}
