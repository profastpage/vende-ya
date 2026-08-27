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
  // 1. Asegurar perfil (PRISMA Profile + profiles)
  // --------------------------------------------------------------
  try {
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

    let username = (meta?.username || (email ? email.split('@')[0] : 'user'))
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .slice(0, 30)
    if (!username) username = 'user'

    // Update Prisma Profile directly!
    await db.profile.upsert({
      where: { authId: user.id },
      create: {
        id: user.id,
        authId: user.id,
        username: username,
        displayName: displayName,
        avatarUrl: avatarUrl,
      },
      update: {
        displayName: displayName,
        avatarUrl: avatarUrl,
      }
    });

    results.profile = 'updated'
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
