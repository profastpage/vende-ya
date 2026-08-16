/**
 * VENDE YA — Supabase client (singleton)
 * =====================================================================
 * Reads URL + anon key from env vars. Falls back to a mock mode if
 * not configured so the app keeps working in dev/sandbox.
 *
 * Env vars (set in .env.local or Vercel):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 * =====================================================================
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  if (!isSupabaseConfigured) {
    // Return a stub that throws on use so callers can detect misconfig
    throw new Error(
      'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // 🔑 PKCE flow: en este modo, Supabase NO redirige al usuario a una
      // URL final tras el callback. En su lugar, devuelve un `code` en la
      // URL que el cliente JS intercambia por una sesión vía
      // `exchangeCodeForSession()`. Esto significa:
      //
      //   1. NO hay redirect final desde Supabase → no hay Site URL fallback
      //      que mande al usuario a una URL protegida por Vercel SSO.
      //   2. La URL `redirect_to` SÍ se respeta siempre (no se valida contra
      //      whitelist para el redirect final, solo para validar el origen).
      //   3. Más seguro contra ataques de interceptación de token.
      //
      // Requiere que `/auth/callback` llame `supabase.auth.exchangeCodeForSession(window.location.href)`.
      flowType: 'pkce',
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
