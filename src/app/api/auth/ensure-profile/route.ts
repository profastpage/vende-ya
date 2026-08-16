import { NextResponse } from 'next/server'
import { getAuthenticatedUser, getServiceClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/ensure-profile
 * =====================================================================
 * Garantiza que el usuario autenticado tenga:
 *   1. Un row en `public.profiles`
 *   2. Un row en `public.seller_wallets` (default: status='active', is_verified=false)
 *
 * Esto es defensa en profundidad: el trigger `handle_new_user()` debería
 * crear el perfil automáticamente al registrarse, pero si falla por
 * cualquier razón (RLS, función corrupta, race condition, etc.), este
 * endpoint lo crea idempotentemente usando el SERVICE_ROLE.
 *
 * Uso: el AuthProvider debe llamar este endpoint tras `onAuthStateChange`
 * con `SIGNED_IN`.
 * =====================================================================
 */
export async function POST(request: Request) {
  const { user, error } = await getAuthenticatedUser(request)
  if (error || !user) {
    return NextResponse.json(
      { ok: false, error: error ?? 'No autenticado' },
      { status: 401 }
    )
  }

  const admin = getServiceClient()
  const results = {
    profile: 'skipped' as 'created' | 'updated' | 'skipped' | 'error',
    wallet: 'skipped' as 'created' | 'updated' | 'skipped' | 'error',
    error: null as string | null,
  }

  // --------------------------------------------------------------
  // 1. Asegurar perfil
  // --------------------------------------------------------------
  try {
    // Verificar si ya existe
    const { data: existing } = await admin
      .from('profiles')
      .select('id, auth_id, email')
      .eq('auth_id', user.id)
      .maybeSingle()

    // Obtener metadatos del usuario desde auth.admin
    const { data: userData } = await admin.auth.admin.getUserById(user.id)
    const meta = userData?.user?.user_metadata ?? {}
    const rawEmail = userData?.user?.email ?? user.email ?? ''

    const displayName =
      meta?.full_name ||
      meta?.name ||
      meta?.display_name ||
      meta?.user_name ||
      (rawEmail ? rawEmail.split('@')[0] : 'Usuario')

    const avatarUrl = meta?.avatar_url || meta?.picture || meta?.photo || null
    const email = rawEmail

    // Generar username único
    let username = (meta?.username || (email ? email.split('@')[0] : 'user'))
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .slice(0, 30)
    if (!username) username = 'user'

    const existingProfile = existing as {
      id: string
      auth_id: string
      email: string | null
      display_name?: string | null
      avatar_url?: string | null
    } | null

    if (existingProfile) {
      // Actualizar email/display_name/avatar si cambiaron
      await admin
        .from('profiles')
        .update({
          email,
          display_name: existingProfile.display_name?.length
            ? existingProfile.display_name
            : displayName,
          avatar_url: existingProfile.avatar_url ?? avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('auth_id', user.id)
      results.profile = 'updated'
    } else {
      // Insertar nuevo perfil
      let attempt = 0
      let inserted = false
      while (!inserted && attempt < 4) {
        attempt++
        const candidate =
          attempt === 1 ? username : `${username}_${attempt}`
        const { error: insErr } = await admin.from('profiles').insert({
          auth_id: user.id,
          username: candidate,
          display_name: displayName,
          email,
          avatar_url: avatarUrl,
        })
        if (!insErr) {
          inserted = true
          results.profile = 'created'
          break
        }
        if (insErr.code !== '23505') {
          // unique_violation
          throw insErr
        }
      }
      if (!inserted) {
        // último intento: username aleatorio
        const randomUser = 'u' + Math.random().toString(36).slice(2, 10)
        const { error: lastErr } = await admin.from('profiles').insert({
          auth_id: user.id,
          username: randomUser,
          display_name: displayName,
          email,
          avatar_url: avatarUrl,
        })
        if (lastErr) throw lastErr
        results.profile = 'created'
      }
    }
  } catch (e: any) {
    results.profile = 'error'
    results.error = `profile: ${e?.message ?? String(e)}`
  }

  // --------------------------------------------------------------
  // 2. Asegurar seller_wallet (default vacío)
  // --------------------------------------------------------------
  try {
    const { data: existingWallet } = await admin
      .from('seller_wallets')
      .select('id, status')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingWallet) {
      const { error: walletErr } = await admin.from('seller_wallets').insert({
        id: user.id,
        gateway_seller_id: `pending-${user.id.slice(0, 8)}`,
        is_verified: false,
        status: 'active',
      })
      if (walletErr && walletErr.code !== '23505') {
        // unique_violation
        throw walletErr
      }
      results.wallet = 'created'
    } else {
      results.wallet = 'skipped'
    }
  } catch (e: any) {
    // Si la tabla seller_wallets no existe, lo ignoramos (lo crea el admin/apply-auth-fix)
    results.wallet = 'skipped'
    if (!results.error) {
      results.error = `wallet: ${e?.message ?? String(e)}`
    }
  }

  // --------------------------------------------------------------
  // 3. Prisma sync (intenta refresh local en DB para caches)
  // --------------------------------------------------------------
  try {
    await db.$queryRaw`SELECT 1`
  } catch {}

  return NextResponse.json({ ok: true, ...results })
}
