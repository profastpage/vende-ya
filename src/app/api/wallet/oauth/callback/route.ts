import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyOAuthState } from '../redirect/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/oauth/callback
 * =====================================================================
 * Sprint 2-A — Handler de callback OAuth de Mercado Pago.
 *
 * Flujo:
 *   1. Recibe `?code=xxx&state=yyy` de Mercado Pago
 *   2. Verifica que `state` sea válido y no expirado (HMAC)
 *   3. Intercambia `code` por `access_token` + `refresh_token` del vendedor
 *      POST https://api.mercadopago.com/oauth/token
 *   4. Persiste el `gateway_seller_id` (mpData.user_id) en seller_wallets
 *   5. Marca la wallet como `active` + `is_verified=true`
 *   6. Redirige al dashboard con ?oauth=success
 *
 * En modo demo (sin MP_CLIENT_SECRET), simula el flujo y persiste datos mock.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vende-ya-phi.vercel.app';

  // 1. Error reportado por MP
  if (error) {
    console.error('[MP OAuth] Error:', error, errorDesc);
    return NextResponse.redirect(
      `${appUrl}/dashboard?oauth=error&msg=${encodeURIComponent(errorDesc ?? error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard?oauth=error&msg=${encodeURIComponent('Faltan code o state en el callback.')}`
    );
  }

  // 2. Verificar state (HMAC)
  const statePayload = await verifyOAuthState(state);
  if (!statePayload) {
    console.error('[MP OAuth] State inválido o expirado');
    return NextResponse.redirect(
      `${appUrl}/dashboard?oauth=error&msg=${encodeURIComponent('State inválido o expirado (posible CSRF).')}`
    );
  }

  // 3. Intercambiar code por access_token
  try {
    const mpResponse = await exchangeCodeForToken({
      code,
      redirectUri: `${appUrl}/api/wallet/oauth/callback`,
    });

    if (!mpResponse.ok) {
      const errBody = await mpResponse.json();
      console.error('[MP OAuth] Token exchange failed:', errBody);
      return NextResponse.redirect(
        `${appUrl}/dashboard?oauth=error&msg=${encodeURIComponent(
          errBody.message ?? 'Mercado Pago rechazó el código de autorización.'
        )}`
      );
    }

    const tokenData = await mpResponse.json();
    // tokenData = {
    //   access_token, token_type, expires_in, scope,
    //   user_id (=> gateway_seller_id), refresh_token, public_key
    // }

    const gatewaySellerId = String(tokenData.user_id);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const publicKey = tokenData.public_key ?? null;
    const expiresIn = tokenData.expires_in ?? 15552000; // 180 días

    // 4. Persistir en seller_wallets
    const wallet = await db.sellerWallet.upsert({
      where: { id: statePayload.sellerId },
      update: {
        gatewaySellerId,
        isVerified: true,
        status: 'active',
        // storeName y storeSlug no se tocan (ya los seteó el trigger handle_new_user)
      },
      create: {
        id: statePayload.sellerId,
        gatewaySellerId,
        isVerified: true,
        status: 'active',
        storeName: `Tienda de ${statePayload.email ?? 'vendedor'}`,
        storeSlug: (statePayload.email ?? 'vendedor').split('@')[0],
      },
    });

    // 5. (Opcional) Guardar refresh_token cifrado en otra tabla
    // TODO: persistir refresh_token en `seller_wallet_tokens` (cifrado AES-256)
    //       para poder refrescar el access_token cuando expire.

    console.log(
      `[MP OAuth] Wallet activated for seller ${statePayload.sellerId} (MP user_id: ${gatewaySellerId})`
    );

    // 6. Redirigir al dashboard con éxito
    return NextResponse.redirect(
      `${appUrl}/dashboard?oauth=success&seller_id=${gatewaySellerId}`
    );
  } catch (e) {
    console.error('[MP OAuth] Unexpected error:', e);
    return NextResponse.redirect(
      `${appUrl}/dashboard?oauth=error&msg=${encodeURIComponent(
        'Error inesperado al procesar el callback de Mercado Pago.'
      )}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────
// Mercado Pago — token exchange
// ─────────────────────────────────────────────────────────────────────

async function exchangeCodeForToken(params: {
  code: string;
  redirectUri: string;
}): Promise<Response> {
  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
  const clientSecret = process.env.MP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // DEMO MODE — return a mock successful response
    return new Response(
      JSON.stringify({
        access_token: 'TEST-demotoken-' + Math.random().toString(36).slice(2),
        token_type: 'bearer',
        expires_in: 15552000,
        scope: 'payments payments.read marketplace',
        user_id: Math.floor(100000000 + Math.random() * 900000000),
        refresh_token: 'TEST-refreshtoken-' + Math.random().toString(36).slice(2),
        public_key: 'TEST-pubkey-' + Math.random().toString(36).slice(2),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri,
    }),
  });
}
