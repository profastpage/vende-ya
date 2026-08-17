'use client'

/**
 * /auth/callback — OAuth callback handler on our own domain (PKCE flow)
 * =====================================================================
 * WHY THIS EXISTS
 * ---------------
 * When the user clicks "Sign in with Google", Supabase sends them to
 * Google, and after Google auth, Google redirects to Supabase's callback
 * (https://qkfgcynfzhjghtsrmdxs.supabase.co/auth/v1/callback?code=...).
 * Supabase exchanges the code for a session, then redirects the browser
 * to the `redirect_to` URL we provided in the original /authorize call.
 *
 * PKCE FLOW (current)
 * -------------------
 * With `flowType: 'pkce'` in the Supabase client config, Supabase returns
 * a `?code=...` in the URL (NOT in the hash fragment). The client JS must
 * call `supabase.auth.exchangeCodeForSession(window.location.href)` to
 * exchange that code for a session.
 *
 * CRITICAL: With @supabase/ssr (cookie-based storage), the code_verifier
 * is stored in a COOKIE (not localStorage). This survives Chrome's bounce
 * tracking mitigation which would otherwise wipe localStorage for
 * supabase.co and cause `AuthPKCECodeVerifierMissingError`.
 *
 * The `createBrowserClient` from @supabase/ssr with `detectSessionInUrl:
 * true` should auto-exchange the code on mount. As a safety net, this
 * page also calls `exchangeCodeForSession` explicitly if a `?code=`
 * is present and the session isn't established yet.
 * =====================================================================
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseSafe } from '@/lib/vendeda/supabase'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { ROUTES } from '@/lib/vendeda/routes'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [exchanging, setExchanging] = React.useState(false)
  const [timedOut, setTimedOut] = React.useState(false)

  // Step 1: Exchange the PKCE code for a session (only once on mount).
  React.useEffect(() => {
    const supabase = getSupabaseSafe()
    if (!supabase || exchanging) return

    const url = window.location.href
    if (!url.includes('code=')) return

    setExchanging(true)
    supabase.auth
      .exchangeCodeForSession(url)
      .then(({ data, error }) => {
        if (error) {
          console.error('[auth/callback] PKCE exchange failed:', error)
          const errMsg = error.message ?? 'error desconocido'
          // Mensaje específico para el error de code verifier missing
          if (errMsg.includes('code_verifier') || errMsg.includes('not found in storage')) {
            setError(
              'Tu navegador bloqueó el almacenamiento de la sesión (Chrome ' +
              'bounce tracking mitigation). Por favor, desactiva bloqueo de ' +
              'cookies de terceros en este sitio o prueba en modo incógnito. ' +
              'Te redirigiremos al login...'
            )
          } else {
            setError(
              'No se pudo completar el inicio de sesión: ' + errMsg
            )
          }
          setTimeout(() => router.replace(ROUTES.login), 3500)
          return
        }
        // Session was established. The onAuthStateChange listener in
        // AuthProvider will fire SIGNED_IN and call /api/auth/ensure-profile.
        if (data?.session?.user) {
          // Already have user — trigger redirect in the next effect.
        }
      })
      .catch((e) => {
        console.error('[auth/callback] PKCE exchange threw:', e)
        setError('Error inesperado al procesar el inicio de sesión.')
        setTimeout(() => router.replace(ROUTES.login), 2500)
      })
      .finally(() => setExchanging(false))
  }, [router, exchanging])

  // Step 2: Wait for the auth state to settle, then redirect.
  React.useEffect(() => {
    if (!loading && !exchanging) {
      if (user) {
        router.replace(ROUTES.dashboard)
      } else if (!error) {
        // No session detected — likely the URL was missing ?code= or
        // already consumed. Send the user back to /login with a hint.
        setError('No se detectó una sesión válida. Vuelve a intentar.')
        setTimeout(() => router.replace(ROUTES.login), 2000)
      }
    }
  }, [loading, user, router, error, exchanging])

  // Safety net: if neither user nor error after 8s, force redirect to /login
  React.useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    if (timedOut && !user) {
      router.replace(ROUTES.login)
    }
  }, [timedOut, user, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="h-10 w-10 rounded-full border-4 border-border border-t-amber-400 animate-spin" />
        <p className="text-sm text-muted-foreground">
          {error ?? 'Procesando inicio de sesión...'}
        </p>
      </div>
    </main>
  )
}
