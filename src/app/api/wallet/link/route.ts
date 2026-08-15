import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
 * Vincula la cuenta de Mercado Pago del vendedor autenticado.
 * Crea o actualiza la fila en seller_wallets.
 *
 * En producción: el frontend primero abre el OAuth de Mercado Pago,
 * MP redirige a /api/wallet/oauth/callback con un code, ese endpoint
 * intercambia el code por el access_token y entonces llama a este
 * endpoint con el gatewaySellerId real.
 */
export async function POST(request: Request) {
  try {
    const body: LinkWalletRequest = await request.json();
    const { gatewaySellerId, oauthCode } = body;

    if (!gatewaySellerId || gatewaySellerId.length < 3) {
      return NextResponse.json(
        { error: 'gatewaySellerId inválido.' },
        { status: 400 }
      );
    }

    // TODO: en prod validar el oauthCode contra Mercado Pago y obtener
    // el real gatewaySellerId del vendedor autenticado.

    // Por ahora usamos el demo seller id fijo (en prod: auth.uid() del JWT)
    const sellerId = 'demo-seller';

    const wallet = await db.sellerWallet.upsert({
      where: { id: sellerId },
      update: {
        gatewaySellerId,
        // En demo mode marcamos isVerified=false para que el dashboard muestre
        // la alerta "KYC pendiente" y el usuario sepa que falta completarlo
        isVerified: false,
        status: 'active',
      },
      create: {
        id: sellerId,
        gatewaySellerId,
        isVerified: false,
        status: 'active',
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
      message:
        'Wallet vinculada. Completa la verificación KYC en Mercado Pago para activar cobros.',
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo vincular la wallet', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
