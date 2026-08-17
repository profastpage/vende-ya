import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { ROUTES } from '@/lib/vendeda/routes'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ROUTES.dashboard

  if (code) {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Redirigir al dashboard (o al destino 'next') una vez obtenida la sesión
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error('[auth/callback] Error de intercambio PKCE:', error)
    } catch (e) {
      console.error('[auth/callback] Error inesperado en callback:', e)
    }
  }

  // Redirigir a login en caso de error
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_failed`)
}
