import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/vendeda/supabase-server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * =====================================================================
 * Returns the authenticated user's profile + wallet status.
 * Used by the frontend to hydrate the dashboard, navbar and protected pages.
 *
 * Response:
 *   200 — { user, wallet }
 *   401 — not authenticated
 */
export async function GET(request: Request) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return NextResponse.json({ error: error ?? 'No autenticado.' }, { status: 401 });
  }

  // Try to fetch the seller_wallet (auto-created by trigger handle_new_user)
  let wallet: {
    status: string;
    isVerified: boolean;
    gatewaySellerId: string | null;
    storeName: string | null;
    storeSlug: string | null;
  } | null = null;
  try {
    const found = await db.sellerWallet.findUnique({
      where: { id: user.id },
      select: {
        status: true,
        isVerified: true,
        gatewaySellerId: true,
        storeName: true,
        storeSlug: true,
      },
    });
    wallet = found;
  } catch (e) {
    // DB might be unreachable — return user without wallet
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    wallet,
  });
}
