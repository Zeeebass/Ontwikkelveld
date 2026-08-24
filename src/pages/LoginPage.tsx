import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/errors'
import { hasSupabaseConfig, isDemoMode } from '../lib/supabase'

const schema = z.object({
  loginName: z.string().trim().min(3, 'Vul je loginnaam in.'),
  password: z.string().min(1, 'Vul je wachtwoord in.'),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/team'} replace />

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitError(null)
      const context = await signIn(values.loginName, values.password)
      navigate(context.role === 'admin' ? '/admin' : '/team', { replace: true })
    } catch (error) { setSubmitError(getErrorMessage(error)) }
  })

  return (
    <main className="login-page">
      <section className="login-stage" aria-hidden="true">
        <div className="login-stage__top"><BrandMark /></div>
        <div className="tactical-field">
          <span className="field-player field-player--1" /><span className="field-player field-player--2" /><span className="field-player field-player--3" />
          <span className="field-player field-player--4" /><span className="field-ball" /><svg viewBox="0 0 500 500"><path d="M146 340C180 250 245 281 262 199S341 100 399 141" /></svg>
        </div>
        <div className="login-stage__copy"><h1>Groei begint waar je kijkt.</h1><p>Persoonlijke ontwikkeling. Eén helder speelplan.</p></div>
      </section>

      <section className="login-panel">
        <div className="login-panel__mobile-brand"><BrandMark /></div>
        <div className="login-form-wrap">
          <LockKeyhole className="login-icon" aria-hidden="true" />
          <h2>Welkom terug</h2>
          <p>Log in met de gegevens die je van je trainer hebt gekregen.</p>
          {!hasSupabaseConfig && !isDemoMode && <div className="notice notice--warning" role="alert">Supabase is nog niet ingesteld. Kopieer <code>.env.example</code> naar <code>.env.local</code> en vul je projectgegevens in.</div>}
          {isDemoMode && <div className="notice">Demo: gebruik <strong>coach</strong> voor admin of <strong>daan8</strong> voor speler. Elk wachtwoord werkt.</div>}
          <form onSubmit={onSubmit} noValidate>
            <label className="field-label">Loginnaam<input autoComplete="username" autoCapitalize="none" {...register('loginName')} aria-invalid={Boolean(errors.loginName)} />{errors.loginName && <span className="field-error">{errors.loginName.message}</span>}</label>
            <div className="field-label"><label htmlFor="login-password">Wachtwoord</label><span className="password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password')} aria-invalid={Boolean(errors.password)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}>{showPassword ? <EyeOff /> : <Eye />}</button></span>{errors.password && <span className="field-error">{errors.password.message}</span>}</div>
            {submitError && <div className="notice notice--error" role="alert">{submitError}</div>}
            <button className="button button--primary button--wide" type="submit" disabled={isSubmitting || (!hasSupabaseConfig && !isDemoMode)}>{isSubmitting ? 'Bezig met inloggen…' : <>Naar Marpunten <ArrowRight aria-hidden="true" /></>}</button>
          </form>
          <p className="login-help">Wachtwoord kwijt? Vraag je trainer om een nieuwe code.</p>
        </div>
      </section>
    </main>
  )
}
