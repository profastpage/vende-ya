import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/vendeda/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LinkWalletRequest {
  gatewaySellerId: string;
  /** En prod vendría del callback OAuth de Mercado Pago */
  oauthCode?: string;
}

/**
 * POST /api/wallet/link
 *
 * Vincula manualmente la cuenta de Mercado Pago del vendedor autenticado.
 * Sprint 2-B: requiere JWT válido. Sprint 2-A: el flujo preferido es OAuth
 * (/api/wallet/oauth/redirect → /api/wallet/oauth/callback), este endpoint
 * queda como fallback manual para casos de prueba o integraciones directas.
 */
export async function POST(request: Request) {
  // 1. Autenticación
  const { user, error: authError } = await getAuthenticatedUser(request);
  if (authError || !user) {
    return NextResponse.json(
      { error: authError ?? 'No autenticado.' },
      { status: 401 }
    );
  }

  try {
    const body: LinkWalletRequest = await request.json();
    const { gatewaySellerId } = body;

    if (!gatewaySellerId || gatewaySellerId.length < 3) {
      return NextResponse.json(
        { error: 'gatewaySellerId inválido.' },
        { status: 400 }
      );
    }

    // 2. Upsert en seller_wallets usando el ID del JWT (no se permite spoofing)
    const wallet = await db.sellerWallet.upsert({
      where: { id: user.id },
      update: {
        gatewaySellerId,
        isVerified: true,
        status: 'active',
      },
      create: {
        id: user.id,
        gatewaySellerId,
        isVerified: true,
        status: 'active',
        storeName: `Tienda de ${user.email?.split('@')[0] ?? 'vendedor'}`,
        storeSlug: (user.email?.split('@')[0] ?? 'vendedor') + '-' + Math.floor(Math.random() * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        gatewaySellerId: wallet.gatewaySellerId,
        isVerified: wallet.isVerified,
        status: wallet.status,
      },
      message: 'Wallet vinculada correctamente. Ya puedes recibir cobros.',
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo vincular la wallet', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
