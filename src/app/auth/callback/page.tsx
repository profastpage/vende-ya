'use client'

/**
 * /auth/callback — OAuth callback handler on our own domain
 * =====================================================================
 * WHY THIS EXISTS
 * ---------------
 * When the user clicks "Sign in with Google", Supabase sends them to
 * Google, and after Google auth, Google redirects to Supabase's callback
 * (https://qkfgcynfzhjghtsrmdxs.supabase.co/auth/v1/callback?code=...).
 * Supabase exchanges the code for a session, then redirects the browser
 * to the `redirect_to` URL we provided in the original /authorize call.
 *
 * BUG THIS FIXES
 * --------------
 * If `redirect_to` is NOT in the Supabase "Redirect URLs" whitelist
 * (Supabase Studio → Authentication → URL Configuration), Supabase
 * silently falls back to the Site URL configured in the same page. If
 * that Site URL is a Vercel preview deployment URL like
 * `vende-ya-profastpage-4762s-projects.vercel.app`, the user ends up
 * there with NO session hash in the URL — Vercel Deployment Protection
 * intercepts the request, and the user sees "You Need Access" instead
 * of being logged in.
 *
 * THE FIX
 * -------
 * We send `redirect_to = https://vende-ya-phi.vercel.app/auth/callback`
 * (this page). This URL is on OUR domain. When the user lands here, the
 * Supabase JS client's `detectSessionInUrl: true` parses the
 * `#access_token=...&refresh_token=...` hash, stores the session in
 * localStorage, and fires onAuthStateChange('SIGNED_IN', session).
 *
 * We then immediately redirect to /dashboard on the SAME origin, where
 * the middleware sees a valid session and lets the user in.
 *
 * IMPORTANT: this page must NOT require a session (it's the page that
 * ESTABLISHES the session). It's in the middleware's PUBLIC_PATHS list.
 * =====================================================================
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { ROUTES } from '@/lib/vendeda/routes'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [timedOut, setTimedOut] = React.useState(false)

  // Wait for the auth state to settle, then redirect.
  React.useEffect(() => {
    // If supabase-js detected the session from the URL hash, `user`
    // becomes non-null. The AuthProvider's onAuthStateChange already
    // called /api/auth/ensure-profile for us. Just navigate.
    if (!loading) {
      if (user) {
        router.replace(ROUTES.dashboard)
      } else {
        // No session detected — likely the URL hash was missing or
        // already consumed. Send the user back to /login with a hint.
        setError('No se detectó una sesión válida. Vuelve a intentar.')
        setTimeout(() => router.replace(ROUTES.login), 2000)
      }
    }
  }, [loading, user, router])

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
