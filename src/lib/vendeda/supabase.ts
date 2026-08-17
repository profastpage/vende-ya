/**
 * VENDE YA — Supabase browser client (SSR-compatible)
 * =====================================================================
 * CRITICAL: We use `createBrowserClient` from `@supabase/ssr` instead of
 * the plain `createClient` from `@supabase/supabase-js`. This stores the
 * session AND the PKCE code verifier in COOKIES instead of localStorage.
 *
 * Why this matters:
 *   - Modern Chrome (2024+) has "bounce tracking mitigation" that wipes
 *     localStorage for sites the user visits without interaction. The
 *     OAuth flow goes: our site → Google → supabase.co callback → our
 *     /auth/callback. Chrome sees supabase.co as a "tracker" and wipes
 *     its localStorage, taking the PKCE verifier with it →
 *     `AuthPKCECodeVerifierMissingError` on return.
 *   - Cookies are NOT affected by bounce tracking mitigation as long as
 *     they're SameSite=Lax (which @supabase/ssr uses by default) and the
 *     callback is on the same site as the initiator.
 *
 * MUST match the server-side client config (supabase-server.ts) — same
 * `flowType: 'pkce'` and same cookie names.
 *
 * Env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 * =====================================================================
 */
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
  _client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // PKCE flow — must match middleware + server client.
      // Browser stores the code_verifier in a cookie (via @supabase/ssr)
      // so it survives the redirect through supabase.co even when Chrome
      // applies bounce tracking mitigation to localStorage.
      flowType: 'pkce',
      // Persist session in cookies (not localStorage).
      persistSession: true,
      // Auto-refresh tokens when they expire.
      autoRefreshToken: true,
      // Detect ?code=... in URL on /auth/callback automatically.
      detectSessionInUrl: true,
    },
    // Use cookies globally — this is what makes PKCE verifier survive.
    cookieOptions: {
      name: 'sb-auth-token',
      // SameSite=Lax so cookies are sent on top-level navigation back
      // from Google → our /auth/callback.
      sameSite: 'lax',
      // secure: true is implied by @supabase/ssr on https URLs.
      // Path covers all routes including /auth/callback.
      path: '/',
      // 7 days — matches Supabase default refresh token lifetime.
      maxAge: 60 * 60 * 24 * 7,
    },
  })
  return _client
}

/** Safe accessor that returns null when Supabase isn't configured. */
export function getSupabaseSafe(): SupabaseClient | null {
  try {
    return getSupabase()
  } catch {
    return null
  }
}
