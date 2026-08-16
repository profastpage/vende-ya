import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/oauth-check?provider=google&redirect_to=https://...
 * -----------------------------------------------------------------
 * Verifica server-side si un provider OAuth (google/facebook/apple) está
 * habilitado en el proyecto de Supabase ANTES de que el navegador navegue
 * a la URL de authorize.
 *
 * Esto evita el problema donde el navegador termina mostrando el JSON crudo:
 *   {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
 *
 * Respuesta:
 *   - { ok: true } → el provider responde 302 (está habilitado), el cliente
 *     puede navegar con seguridad.
 *   - { ok: false, status: 400, body: '{"code":400,...}' } → el provider
 *     no está activado. El cliente humaniza el error y lo muestra como toast.
 *
 * Esta ruta corre server-side → no hay restricciones CORS.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const provider = searchParams.get('provider')
  // 🔑 REDIRECT CANÓNICO: preferir NEXT_PUBLIC_APP_URL (URL de producción
  // pública) sobre req.nextUrl.origin para que el callback OAuth SIEMPRE
  // caiga en la URL pública, evitando Vercel Deployment Protection en
  // deployments preview protegidos.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  const redirectTo =
    searchParams.get('redirect_to') ?? `${appUrl}/dashboard`

  if (!provider || !['google', 'facebook', 'apple'].includes(provider)) {
    return NextResponse.json(
      { ok: false, error: 'Falta o es inválido el parámetro `provider`.' },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase no configurado → modo demo → ningún provider está disponible.
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        body: JSON.stringify({
          code: 400,
          error_code: 'validation_failed',
          msg: 'Unsupported provider: provider is not enabled',
        }),
      },
      { status: 200 }
    )
  }

  // Construir la URL de authorize tal como lo hace el cliente JS de Supabase
  const url = new URL(`${supabaseUrl}/auth/v1/authorize`)
  url.searchParams.set('provider', provider)
  url.searchParams.set('redirect_to', redirectTo)

  try {
    const probe = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'manual', // No seguir el 302 → Google
      headers: {
        apikey: supabaseAnonKey,
        Accept: 'application/json',
      },
    })

    // 302 / opaqueredirect → provider habilitado, OK navegar.
    if (
      probe.status === 302 ||
      probe.status === 0 ||
      probe.type === 'opaqueredirect'
    ) {
      return NextResponse.json({ ok: true })
    }

    // 400 / 500 → provider no habilitado o error de config.
    if (probe.status >= 400) {
      const body = await probe.text().catch(() => '')
      return NextResponse.json(
        { ok: false, status: probe.status, body },
        { status: 200 }
      )
    }

    // 200 (raro aquí) → asumimos OK.
    return NextResponse.json({ ok: true })
  } catch (e) {
    // Error de red → asumimos OK y dejamos que el navegador navegue.
    return NextResponse.json({ ok: true, note: 'probe failed (network)' })
  }
}
