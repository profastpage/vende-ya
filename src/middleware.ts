/**
 * VENDE YA — Middleware
 * =====================================================================
 * - Refreshes the Supabase auth session on every server request so the
 *   user stays logged in without re-logging in.
 * - Public paths skip auth checks. Protected paths (/dashboard, /wallet,
 *   /pagos, /vender, /envios, /mensajes, /notificaciones, /perfil,
 *   /configuracion) require a session — otherwise redirect to /login.
 *
 * Used by:
 *   - Next.js Edge runtime (configured in next.config)
 * =====================================================================
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/registro',
  '/auth/callback', // OAuth callback handler on our domain (establishes session)
  '/marketplace',
  '/en-vivo',
  '/subastas',
  '/vendedores',
  '/buscar',
  '/productos', // product detail pages are public
  '/faq',
  '/soporte',
  '/terminos',
  '/privacidad',
  '/reportar-infraccion',
  '/api/health',
  '/api/webhooks', // webhook signature-verified elsewhere
  '/api/copyright-reports', // public submit form
  '/api/shalom/agencies', // public agency list
  '/api/shalom/quote', // public quote
]

const PROTECTED_PATHS = [
  '/dashboard',
  '/wallet',
  '/pagos',
  '/vender',
  '/envios',
  '/mensajes',
  '/notificaciones',
  '/perfil',
  '/configuracion',
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip when Supabase isn't configured (dev/sandbox mode)
  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  // Refresh session — ensures cookies stay fresh
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const isProtected = PROTECTED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (isProtected && !session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // If logged in and visiting /login, redirect to dashboard
    if (session && (pathname === '/login' || pathname === '/registro')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  } catch (e) {
    // Don't block the request — just continue without auth
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)',
  ],
}
