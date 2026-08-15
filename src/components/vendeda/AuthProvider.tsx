'use client'

/**
 * VENDE YA — Auth context
 * =====================================================================
 * Wraps Supabase auth with a typed React context. Provides:
 *   - user, loading, signIn, signUp, signOut, signInWithOAuth
 *   - auto-profile creation on signup (calls /api/auth/onboarding)
 *   - demo mode fallback when Supabase isn't configured (uses localStorage)
 *
 * Usage:
 *   const { user, signIn, signOut } = useAuth()
 *
 * Wrap your app: <AuthProvider><App /></AuthProvider>
 * =====================================================================
 */
import * as React from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseSafe, isSupabaseConfigured } from '@/lib/vendeda/supabase'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import type { Profile } from '@/lib/vendeda/types'

export interface AuthUser {
  id: string
  email: string | null
  phone: string | null
  displayName: string
  avatarUrl: string | null
  isDemo: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isDemoMode: boolean
  /** Current access token (JWT) — pass to API routes via `Authorization: Bearer xxx` */
  accessToken: string | null
  /** Fetch wrapper that auto-attaches the JWT bearer header */
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (params: {
    email: string
    password: string
    displayName: string
    phone?: string
  }) => Promise<{ error: string | null }>
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const DEMO_USER_KEY = 'vendeya:demoUser'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const supabase = getSupabaseSafe()

  // =====================================================================
  // INITIALIZE — restore session
  // =====================================================================
  React.useEffect(() => {
    let mounted = true

    const init = async () => {
      if (supabase) {
        // Real Supabase mode
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(supabaseUserToAuthUser(session.user))
          setAccessToken(session.access_token ?? null)
        }

        // Subscribe to auth changes (token refresh included)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!mounted) return
            setUser(session?.user ? supabaseUserToAuthUser(session.user) : null)
            setAccessToken(session?.access_token ?? null)
          }
        )

        setLoading(false)
        return () => subscription.unsubscribe()
      } else {
        // Demo mode — restore from localStorage
        const stored = typeof window !== 'undefined'
          ? window.localStorage.getItem(DEMO_USER_KEY)
          : null
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {}
        }
        // Demo token — backend treats 'demo' as a special non-verified case
        setAccessToken('demo')
        setLoading(false)
      }
    }

    init()
    return () => { mounted = false }
  }, [supabase])

  // =====================================================================
  // ACTIONS
  // =====================================================================
  const signIn = React.useCallback(async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    }
    // Demo mode
    await new Promise((r) => setTimeout(r, 500))
    const demoUser: AuthUser = {
      id: 'demo-' + Date.now(),
      email,
      phone: null,
      displayName: MOCK_PROFILES[5].displayName,
      avatarUrl: MOCK_PROFILES[5].avatarUrl ?? null,
      isDemo: true,
    }
    window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    return { error: null }
  }, [supabase])

  const signUp = React.useCallback(async (params: {
    email: string; password: string; displayName: string; phone?: string
  }) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        phone: params.phone,
        options: {
          data: {
            display_name: params.displayName,
            username: params.displayName.toLowerCase().replace(/\s+/g, '.'),
          },
        },
      })
      if (error) return { error: error.message }
      // Profile row is auto-created by the `handle_new_user` trigger in
      // /docs/supabase-schema.sql. No client-side insert needed.
      return { error: null }
    }
    // Demo mode
    await new Promise((r) => setTimeout(r, 800))
    const demoUser: AuthUser = {
      id: 'demo-' + Date.now(),
      email: params.email,
      phone: params.phone ?? null,
      displayName: params.displayName,
      avatarUrl: MOCK_PROFILES[5].avatarUrl ?? null,
      isDemo: true,
    }
    window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
    return { error: null }
  }, [supabase])

  const signInWithOAuth = React.useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/dashboard' },
      })
      return { error: error?.message ?? null }
    }
    return { error: 'OAuth no disponible en modo demo' }
  }, [supabase])

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      window.localStorage.removeItem(DEMO_USER_KEY)
    }
    setUser(null)
    setAccessToken(null)
  }, [supabase])

  /**
   * Fetch wrapper that auto-attaches `Authorization: Bearer <jwt>`.
   * Falls back to plain fetch when no token is available.
   */
  const authedFetch = React.useCallback(
    (input: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers)
      if (accessToken && accessToken !== 'demo') {
        headers.set('Authorization', `Bearer ${accessToken}`)
      }
      // Always send cookies — the middleware reads the sb-* cookies too
      return fetch(input, { ...init, headers, credentials: 'include' })
    },
    [accessToken]
  )

  const value: AuthContextValue = {
    user,
    loading,
    isDemoMode: !isSupabaseConfigured,
    accessToken,
    authedFetch,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

// =====================================================================
// HELPERS
// =====================================================================
function supabaseUserToAuthUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email ?? null,
    phone: u.phone ?? null,
    displayName: u.user_metadata?.display_name ?? u.user_metadata?.name ?? (u.email ? u.email.split('@')[0] : 'Usuario'),
    avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture ?? null,
    isDemo: false,
  }
}

/** Convert a Supabase user to the Vende Ya Profile shape (with defaults). */
export function authUserToProfile(u: AuthUser): Profile {
  return {
    id: u.id,
    username: u.displayName.toLowerCase().replace(/\s+/g, '.'),
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: null,
    rating: 0,
    ratingsCount: 0,
    salesCount: 0,
    isVerified: false,
    isLiveSeller: false,
    followerCount: 0,
    department: null,
    locale: 'es-PE',
  }
}
