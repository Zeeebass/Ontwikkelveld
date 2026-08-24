import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Copy, ImagePlus, KeyRound, Pencil, Plus, Power, Trash2, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { GrowthValue } from '../../components/GrowthValue'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import { EmptyState, ErrorState, LoadingState } from '../../components/QueryState'
import {
  deleteMedia, deleteProgress, deleteQuestion, getAdminPlayer, getPeriods, resetPlayerPassword,
  saveMedia, saveProgress, saveQuestion, setPlayerActive, updatePlayerProfile, uploadPlayerAvatar,
} from '../../lib/api'
import { getErrorMessage } from '../../lib/errors'
import { formatDate } from '../../lib/format'
import { isSafeExternalUrl } from '../../lib/youtube'
import type { AdminPlayerDetail, MediaInput, Period, PlayerMedia, PlayerQuestion, ProgressEntry, ProgressInput, QuestionInput } from '../../types/app'

const optionalNumber = z.number().int().min(1).max(99).optional()
const profileSchema = z.object({ firstName: z.string().trim().min(1, 'Voornaam is verplicht.'), lastName: z.string().trim().min(1, 'Achternaam is verplicht.'), position: z.string().trim().max(40).optional(), shirtNumber: optionalNumber })
type ProfileValues = z.infer<typeof profileSchema>

const progressSchema = z.object({ periodId: z.string().uuid('Kies een periode.'), points: z.coerce.number().int().positive('Gebruik een positief aantal.'), title: z.string().trim().min(1, 'Titel is verplicht.').max(120), description: z.string().trim().max(2000).optional() })
type ProgressValues = z.infer<typeof progressSchema>

const questionSchema = z.object({ periodId: z.string().optional(), question: z.string().trim().min(1, 'Vraag of onderwerp is verplicht.').max(500), answer: z.string().trim().min(1, 'Antwoord of uitleg is verplicht.').max(4000), category: z.string().trim().max(60).optional() })
type QuestionValues = z.infer<typeof questionSchema>

const mediaSchema = z.object({ periodId: z.string().optional(), title: z.string().trim().min(1, 'Titel is verplicht.').max(120), url: z.string().trim().refine(isSafeExternalUrl, 'Gebruik een geldige http- of https-link.'), description: z.string().trim().max(2000).optional() })
type MediaValues = z.infer<typeof mediaSchema>

function invalidatePlayer(queryClient: ReturnType<typeof useQueryClient>, playerId: string) {
  void queryClient.invalidateQueries({ queryKey: ['admin-player', playerId] })
  void queryClient.invalidateQueries({ queryKey: ['admin-players'] })
  void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['team-growth'] })
}

function ProfileEditor({ player, onClose }: { player: AdminPlayerDetail; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { firstName: player.firstName, lastName: player.lastName, position: player.position ?? '', shirtNumber: player.shirtNumber ?? undefined } })
  const mutation = useMutation({ mutationFn: (values: ProfileValues) => updatePlayerProfile(player, { ...values, position: values.position || null, shirtNumber: values.shirtNumber ?? null }), onSuccess: () => { invalidatePlayer(queryClient, player.id); onClose() } })
  return <form className="form-grid profile-editor" onSubmit={handleSubmit((values) => mutation.mutate(values))}><label className="field-label">Voornaam<input {...register('firstName')} />{errors.firstName && <span className="field-error">{errors.firstName.message}</span>}</label><label className="field-label">Achternaam<input {...register('lastName')} />{errors.lastName && <span className="field-error">{errors.lastName.message}</span>}</label><label className="field-label">Positie<input {...register('position')} /></label><label className="field-label">Rugnummer<input type="number" min="1" max="99" {...register('shirtNumber', { setValueAs: (value) => value === '' ? undefined : Number(value) })} /></label>{mutation.error && <div className="notice notice--error form-grid__wide">{getErrorMessage(mutation.error)}</div>}<div className="button-row form-grid__wide"><button className="button button--primary" disabled={mutation.isPending}>{mutation.isPending ? 'Opslaan…' : 'Profiel opslaan'}</button><button className="button button--secondary" type="button" onClick={onClose}>Annuleren</button></div></form>
}

function ProgressEditor({ playerId, periods, item, onClose }: { playerId: string; periods: Period[]; item: ProgressEntry | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const current = periods.find((period) => period.isCurrent)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgressValues>({ resolver: zodResolver(progressSchema), defaultValues: { periodId: item?.periodId ?? current?.id ?? '', points: item?.points ?? 100, title: item?.title ?? '', description: item?.description ?? '' } })
  useEffect(() => reset({ periodId: item?.periodId ?? current?.id ?? '', points: item?.points ?? 100, title: item?.title ?? '', description: item?.description ?? '' }), [item, current?.id, reset])
  const mutation = useMutation({ mutationFn: (values: ProgressValues) => saveProgress(playerId, values as ProgressInput, item?.id), onSuccess: () => { invalidatePlayer(queryClient, playerId); onClose() } })
  return <form className="entry-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}><div className="entry-form__top"><h3>{item ? 'Progressie bewerken' : 'Progressie toevoegen'}</h3><button className="icon-button" type="button" onClick={onClose} aria-label="Formulier sluiten"><X /></button></div><div className="form-grid"><label className="field-label">Periode<select {...register('periodId')}><option value="">Kies periode</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}{period.isCurrent ? ' — huidig' : ''}</option>)}</select>{errors.periodId && <span className="field-error">{errors.periodId.message}</span>}</label><label className="field-label">Punten<input type="number" min="1" {...register('points')} />{errors.points && <span className="field-error">{errors.points.message}</span>}</label><label className="field-label form-grid__wide">Titel<input {...register('title')} placeholder="Bijv. Scannen voor balaanname" />{errors.title && <span className="field-error">{errors.title.message}</span>}</label><label className="field-label form-grid__wide">Omschrijving<textarea rows={3} {...register('description')} /></label></div>{mutation.error && <div className="notice notice--error">{getErrorMessage(mutation.error)}</div>}<button className="button button--primary" disabled={mutation.isPending}>{mutation.isPending ? 'Opslaan…' : item ? 'Wijzigingen opslaan' : 'Groei toevoegen'}</button></form>
}

function QuestionEditor({ playerId, periods, item, onClose }: { playerId: string; periods: Period[]; item: PlayerQuestion | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionValues>({ resolver: zodResolver(questionSchema), defaultValues: { periodId: item?.periodId ?? '', question: item?.question ?? '', answer: item?.answer ?? '', category: item?.category ?? '' } })
  useEffect(() => reset({ periodId: item?.periodId ?? '', question: item?.question ?? '', answer: item?.answer ?? '', category: item?.category ?? '' }), [item, reset])
  const mutation = useMutation({ mutationFn: (values: QuestionValues) => saveQuestion(playerId, { ...values, periodId: values.periodId || null } as QuestionInput, item?.id), onSuccess: () => { invalidatePlayer(queryClient, playerId); onClose() } })
  return <form className="entry-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}><div className="entry-form__top"><h3>{item ? 'Leeritem bewerken' : 'Leeritem toevoegen'}</h3><button className="icon-button" type="button" onClick={onClose} aria-label="Formulier sluiten"><X /></button></div><div className="form-grid"><label className="field-label">Periode<select {...register('periodId')}><option value="">Altijd relevant</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></label><label className="field-label">Categorie<input {...register('category')} placeholder="Bijv. Tactisch" /></label><label className="field-label form-grid__wide">Vraag of onderwerp<textarea rows={2} {...register('question')} />{errors.question && <span className="field-error">{errors.question.message}</span>}</label><label className="field-label form-grid__wide">Antwoord of uitleg<textarea rows={4} {...register('answer')} />{errors.answer && <span className="field-error">{errors.answer.message}</span>}</label></div>{mutation.error && <div className="notice notice--error">{getErrorMessage(mutation.error)}</div>}<button className="button button--primary" disabled={mutation.isPending}>{mutation.isPending ? 'Opslaan…' : 'Leeritem opslaan'}</button></form>
}

function MediaEditor({ playerId, periods, item, onClose }: { playerId: string; periods: Period[]; item: PlayerMedia | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MediaValues>({ resolver: zodResolver(mediaSchema), defaultValues: { periodId: item?.periodId ?? '', title: item?.title ?? '', url: item?.url ?? '', description: item?.description ?? '' } })
  useEffect(() => reset({ periodId: item?.periodId ?? '', title: item?.title ?? '', url: item?.url ?? '', description: item?.description ?? '' }), [item, reset])
  const mutation = useMutation({ mutationFn: (values: MediaValues) => saveMedia(playerId, { ...values, periodId: values.periodId || null, mediaType: 'link' } as MediaInput, item?.id), onSuccess: () => { invalidatePlayer(queryClient, playerId); onClose() } })
  return <form className="entry-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}><div className="entry-form__top"><h3>{item ? 'Materiaal bewerken' : 'Materiaal toevoegen'}</h3><button className="icon-button" type="button" onClick={onClose} aria-label="Formulier sluiten"><X /></button></div><div className="form-grid"><label className="field-label">Periode<select {...register('periodId')}><option value="">Altijd relevant</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></label><label className="field-label form-grid__wide">Titel<input {...register('title')} />{errors.title && <span className="field-error">{errors.title.message}</span>}</label><label className="field-label form-grid__wide">URL<input inputMode="url" {...register('url')} placeholder="https://youtube.com/…" />{errors.url && <span className="field-error">{errors.url.message}</span>}</label><label className="field-label form-grid__wide">Omschrijving<textarea rows={3} {...register('description')} /></label></div>{mutation.error && <div className="notice notice--error">{getErrorMessage(mutation.error)}</div>}<button className="button button--primary" disabled={mutation.isPending}>{mutation.isPending ? 'Opslaan…' : 'Materiaal opslaan'}</button></form>
}

export function AdminPlayerPage() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const playerQuery = useQuery({ queryKey: ['admin-player', id], queryFn: () => getAdminPlayer(id), enabled: Boolean(id) })
  const periodsQuery = useQuery({ queryKey: ['periods'], queryFn: getPeriods })
  const [profileOpen, setProfileOpen] = useState(false)
  const [credential, setCredential] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [progressEditor, setProgressEditor] = useState<ProgressEntry | 'new' | null>(null)
  const [questionEditor, setQuestionEditor] = useState<PlayerQuestion | 'new' | null>(null)
  const [mediaEditor, setMediaEditor] = useState<PlayerMedia | 'new' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const refresh = () => invalidatePlayer(queryClient, id)
  const statusMutation = useMutation({ mutationFn: ({ active }: { active: boolean }) => setPlayerActive(id, active), onSuccess: () => { setActionError(null); refresh() }, onError: (error) => setActionError(getErrorMessage(error)) })
  const passwordMutation = useMutation({ mutationFn: () => resetPlayerPassword(id), onSuccess: (result) => { setCredential(result.password); setActionError(null) }, onError: (error) => setActionError(getErrorMessage(error)) })
  const avatarMutation = useMutation({ mutationFn: ({ player, file }: { player: AdminPlayerDetail; file: File }) => uploadPlayerAvatar(player, file), onSuccess: refresh, onError: (error) => setActionError(getErrorMessage(error)) })
  const deleteMutation = useMutation({ mutationFn: ({ type, itemId }: { type: 'progress' | 'question' | 'media'; itemId: string }) => type === 'progress' ? deleteProgress(itemId) : type === 'question' ? deleteQuestion(itemId) : deleteMedia(itemId), onSuccess: refresh, onError: (error) => setActionError(getErrorMessage(error)) })

  if (playerQuery.isLoading || periodsQuery.isLoading) return <LoadingState label="Spelersdossier openen…" />
  if (playerQuery.error || periodsQuery.error) return <ErrorState message={(playerQuery.error ?? periodsQuery.error)!.message} onRetry={() => { void playerQuery.refetch(); void periodsQuery.refetch() }} />
  const player = playerQuery.data!
  const periods = periodsQuery.data ?? []
  const avatarChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) avatarMutation.mutate({ player, file }) }
  const copyCredential = async () => { if (!credential) return; await navigator.clipboard.writeText(`Loginnaam: ${player.loginName}\nWachtwoord: ${credential}`); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
  return (
    <div className="page page--player-admin">
      <Link className="back-link" to="/admin/players"><ArrowLeft /> Terug naar spelers</Link>
      <header className="player-dossier-header">
        <div className="player-dossier-header__identity"><div className="avatar-upload"><PlayerAvatar firstName={player.firstName} lastName={player.lastName} url={player.avatarUrl} size="large" /><label className="icon-button" aria-label="Spelersfoto wijzigen"><ImagePlus /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={avatarChange} /></label></div><div><h1>{player.firstName} {player.lastName}</h1><p>{player.shirtNumber ? `#${player.shirtNumber} · ` : ''}{player.position || 'Positie niet ingevuld'} · <code>{player.loginName}</code></p><span className={`status ${player.active ? 'status--active' : 'status--inactive'}`}>{player.active ? 'Actief account' : 'Inactief account'}</span></div></div>
        <div className="player-dossier-header__score"><span>Totale Groeiwaarde</span><GrowthValue points={player.totalPoints} size="large" /></div>
        <div className="player-dossier-header__actions"><button className="button button--secondary" type="button" onClick={() => setProfileOpen((value) => !value)}><Pencil /> Profiel bewerken</button><button className="button button--secondary" type="button" disabled={passwordMutation.isPending} onClick={() => passwordMutation.mutate()}><KeyRound /> Wachtwoord vernieuwen</button><button className={`button ${player.active ? 'button--danger' : 'button--primary'}`} type="button" disabled={statusMutation.isPending} onClick={() => { if (!player.active || window.confirm(`${player.firstName} deactiveren en de toegang blokkeren?`)) statusMutation.mutate({ active: !player.active }) }}><Power /> {player.active ? 'Deactiveren' : 'Activeren'}</button></div>
      </header>
      {actionError && <div className="notice notice--error" role="alert">{actionError}</div>}
      {profileOpen && <section className="editor-panel"><h2>Profielgegevens</h2><ProfileEditor player={player} onClose={() => setProfileOpen(false)} /></section>}
      {credential && <section className="credentials credentials--compact" aria-live="polite"><KeyRound aria-hidden="true" /><div><h2>Nieuw wachtwoord</h2><p>Dit wordt maar één keer getoond. Deel het veilig met {player.firstName}.</p><dl><div><dt>Loginnaam</dt><dd>{player.loginName}</dd></div><div><dt>Wachtwoord</dt><dd>{credential}</dd></div></dl><div className="button-row"><button className="button button--primary" type="button" onClick={() => void copyCredential()}>{copied ? <Check /> : <Copy />}{copied ? 'Gekopieerd' : 'Kopiëren'}</button><button className="button button--secondary" type="button" onClick={() => setCredential(null)}>Sluiten</button></div></div></section>}

      <section className="dossier-section"><header><div><h2>Progressie</h2><p>Losse ontwikkelmomenten die optellen tot de Groeiwaarde.</p></div><button className="button button--primary button--small" type="button" onClick={() => setProgressEditor('new')}><Plus /> Progressie</button></header>{progressEditor && <ProgressEditor playerId={id} periods={periods} item={progressEditor === 'new' ? null : progressEditor} onClose={() => setProgressEditor(null)} />}{player.progress.length ? <div className="admin-entry-list">{player.progress.map((item) => <article key={item.id}><div className="admin-entry-list__date">{formatDate(item.createdAt)}</div><div><h3>{item.title}</h3><p>{item.periodName}{item.description ? ` · ${item.description}` : ''}</p></div><GrowthValue points={item.points} size="small" /><div className="row-actions"><button className="icon-button" type="button" onClick={() => setProgressEditor(item)} aria-label={`${item.title} bewerken`}><Pencil /></button><button className="icon-button icon-button--danger" type="button" onClick={() => { if (window.confirm(`“${item.title}” verwijderen?`)) deleteMutation.mutate({ type: 'progress', itemId: item.id }) }} aria-label={`${item.title} verwijderen`}><Trash2 /></button></div></article>)}</div> : <EmptyState title="Nog geen progressie" description="Voeg het eerste ontwikkelmoment toe." />}</section>

      <section className="dossier-section"><header><div><h2>Vragen & antwoorden</h2><p>Persoonlijke aandachtspunten, instructies en reflectievragen.</p></div><button className="button button--primary button--small" type="button" onClick={() => setQuestionEditor('new')}><Plus /> Leeritem</button></header>{questionEditor && <QuestionEditor playerId={id} periods={periods} item={questionEditor === 'new' ? null : questionEditor} onClose={() => setQuestionEditor(null)} />}{player.questions.length ? <div className="admin-entry-list admin-entry-list--text">{player.questions.map((item) => <article key={item.id}><div><div className="content-meta"><span>{item.category || 'Persoonlijk'}</span><span>{item.periodName || 'Altijd relevant'}</span></div><h3>{item.question}</h3><p>{item.answer}</p></div><div className="row-actions"><button className="icon-button" type="button" onClick={() => setQuestionEditor(item)} aria-label="Leeritem bewerken"><Pencil /></button><button className="icon-button icon-button--danger" type="button" onClick={() => { if (window.confirm('Dit leeritem verwijderen?')) deleteMutation.mutate({ type: 'question', itemId: item.id }) }} aria-label="Leeritem verwijderen"><Trash2 /></button></div></article>)}</div> : <EmptyState title="Nog geen leeritems" description="Voeg een vraag, uitleg of persoonlijk aandachtspunt toe." />}</section>

      <section className="dossier-section"><header><div><h2>Video's & materiaal</h2><p>YouTube-fragmenten worden ingebed; andere links openen veilig extern.</p></div><button className="button button--primary button--small" type="button" onClick={() => setMediaEditor('new')}><Plus /> Materiaal</button></header>{mediaEditor && <MediaEditor playerId={id} periods={periods} item={mediaEditor === 'new' ? null : mediaEditor} onClose={() => setMediaEditor(null)} />}{player.media.length ? <div className="admin-entry-list admin-entry-list--text">{player.media.map((item) => <article key={item.id}><div><div className="content-meta"><span>{item.mediaType === 'youtube' ? 'YouTube' : 'Link'}</span><span>{item.periodName || 'Altijd relevant'}</span></div><h3>{item.title}</h3><p>{item.description || item.url}</p></div><div className="row-actions"><button className="icon-button" type="button" onClick={() => setMediaEditor(item)} aria-label={`${item.title} bewerken`}><Pencil /></button><button className="icon-button icon-button--danger" type="button" onClick={() => { if (window.confirm(`“${item.title}” verwijderen?`)) deleteMutation.mutate({ type: 'media', itemId: item.id }) }} aria-label={`${item.title} verwijderen`}><Trash2 /></button></div></article>)}</div> : <EmptyState title="Nog geen materiaal" description="Voeg een YouTube-video of externe link toe." />}</section>
    </div>
  )
}
