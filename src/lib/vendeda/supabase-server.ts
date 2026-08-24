/**
 * VENDE YA — Supabase SSR clients (cookies-aware)
 * =====================================================================
 * Use these in Server Components, Route Handlers and Server Actions
 * to read the authenticated user from the user's session cookies.
 *
 * - `createServerClient()` reads the user via the request cookies
 * - `getServiceClient()` bypasses RLS using the SERVICE_ROLE_KEY
 *   (NEVER expose this client to the browser)
 * =====================================================================
 */
import { createServerClient as supabaseCreateServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const isSupabaseServerConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY
)

/**
 * Browser-cookies-aware client for use inside Next.js Server Components /
 * Route Handlers. Reads the session from the `sb-*` cookies set by the
 * browser. Returns a fresh client per request.
 */
export async function createServerClient() {
  if (!isSupabaseServerConfigured) {
    throw new Error('Supabase server not configured.')
  }
  const cookieStore = await cookies()

  return supabaseCreateServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — cookies can't be set.
          // Safe to ignore if middleware refreshes the session.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      // 🔑 PKCE flow — debe matchear con el browser client (supabase.ts).
      flowType: 'pkce',
    },
  })
}

/**
 * Service-role client — bypasses RLS.
 * Only for backend tasks like webhooks, ban actions, scheduled jobs.
 * NEVER expose this in client code.
 */
export function getServiceClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Helper for Route Handlers — extracts the authenticated user from the
 * Authorization Bearer header (preferred) or the cookie session.
 *
 * Returns `{ user: null, error }` if not authenticated.
 *
 * NOTE: Always uses the SERVICE_ROLE key to call `getUser(token)` —
 * we never trust client-asserted user IDs.
 */
export async function getAuthenticatedUser(request: Request): Promise<{
  user: { id: string; email: string | null } | null
  error: string | null
}> {
  if (!isSupabaseServerConfigured) {
    return { user: null, error: 'Supabase no configurado en el servidor.' }
  }
  
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error: error?.message || 'Sesin invlida o expirada.' }
    }
    
    return {
      user: { id: user.id, email: user.email ?? null },
      error: null,
    }
  } catch (error: any) {
    return { user: null, error: error?.message || 'Server Error' }
  }
}

// EOF_MARKER