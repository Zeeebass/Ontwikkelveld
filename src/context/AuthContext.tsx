/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserContext } from '../types/app'
import { toAuthEmail } from '../lib/credentials'
import { getMyContext } from '../lib/api'
import { getErrorMessage } from '../lib/errors'
import { isDemoMode, requireSupabase, supabase } from '../lib/supabase'

type AuthState = {
  user: UserContext | null
  loading: boolean
  error: string | null
  signIn: (loginName: string, password: string) => Promise<UserContext>
  signOut: () => Promise<void>
  refreshContext: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshContext = useCallback(async () => {
    const context = await getMyContext()
    setUser(context)
    setError(null)
  }, [])

  useEffect(() => {
    let mounted = true
    const initialize = async () => {
      try {
        if (isDemoMode) {
          if (localStorage.getItem('marpunten-demo-user')) await refreshContext()
          return
        }
        if (!supabase) return
        const { data } = await supabase.auth.getSession()
        if (data.session && mounted) await refreshContext()
      } catch (initialError) {
        if (mounted) setError(getErrorMessage(initialError))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void initialize()

    const subscription = !isDemoMode && supabase
      ? supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_OUT') setUser(null)
        }).data.subscription
      : null
    return () => { mounted = false; subscription?.unsubscribe() }
  }, [refreshContext])

  const signIn = useCallback(async (loginName: string, password: string) => {
    setError(null)
    try {
      if (isDemoMode) {
        const demoUser = loginName.trim().toLowerCase() === 'coach' ? 'coach' : 'daan8'
        localStorage.setItem('marpunten-demo-user', demoUser)
      } else {
        const { error: signInError } = await requireSupabase().auth.signInWithPassword({ email: toAuthEmail(loginName), password })
        if (signInError) throw new Error('Loginnaam of wachtwoord klopt niet.')
      }
      const context = await getMyContext()
      if (!context.active) {
        if (!isDemoMode) await requireSupabase().auth.signOut()
        throw new Error('Dit account is gedeactiveerd. Neem contact op met je trainer.')
      }
      setUser(context)
      return context
    } catch (signInError) {
      const message = getErrorMessage(signInError, 'Inloggen is niet gelukt.')
      setError(message)
      throw new Error(message, { cause: signInError })
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) localStorage.removeItem('marpunten-demo-user')
    else await requireSupabase().auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, error, signIn, signOut, refreshContext }), [user, loading, error, signIn, signOut, refreshContext])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth moet binnen AuthProvider worden gebruikt.')
  return value
}
