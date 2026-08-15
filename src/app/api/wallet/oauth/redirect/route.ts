import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/vendeda/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/oauth/redirect
 * =====================================================================
 * Sprint 2-A — Inicia el flujo OAuth de Mercado Pago.
 *
 * Flujo:
 *   1. Verifica que el vendedor esté autenticado (JWT)
 *   2. Construye la URL de autorización de MP con:
 *      - client_id         = NEXT_PUBLIC_MP_CLIENT_ID
 *      - response_type     = code
 *      - redirect_uri      = NEXT_PUBLIC_APP_URL/api/wallet/oauth/callback
 *      - state             = JWT-encoded sellerId (CSRF protection)
 *   3. Redirige al navegador a Mercado Pago
 *
 * Mercado Pago Perú authorize URL:
 *   https://auth.mercadopago.com/authorization?client_id=...&response_type=code&...
 *
 * Scopes requeridos para split payments:
 *   - payments:         Cobrar en nombre del vendedor
 *   - marketplace:      Operar como marketplace (split)
 *   - wallet_balance:   Consultar saldo de la wallet
 *   - card:             Tokenizar tarjetas
 */
export async function GET(request: Request) {
  // 1. Verificar autenticación
  const { user, error: authError } = await getAuthenticatedUser(request);
  if (authError || !user) {
    return NextResponse.json(
      { error: authError ?? 'No autenticado.' },
      { status: 401 }
    );
  }

  const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vende-ya-phi.vercel.app';
  const redirectUri = `${appUrl}/api/wallet/oauth/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          'Mercado Pago no configurado. Falta NEXT_PUBLIC_MP_CLIENT_ID en Vercel env vars.',
        hint: 'Crea una app en https://www.mercadopago.com.pe/developers/panel/app y agrega el Client ID.',
      },
      { status: 503 }
    );
  }

  // 2. State — JWT-style signed payload (here we use base64 of JSON for simplicity)
  // In production, sign with HMAC SHA256 + SUPABASE_JWT_SECRET
  const state = await buildOAuthState({
    sellerId: user.id,
    email: user.email,
    nonce: crypto.randomUUID(),
    issuedAt: Date.now(),
  });

  // 3. Construir URL de autorización
  const authUrl = new URL('https://auth.mercadopago.com/authorization');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('platform_id', 'mp');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  // Scopes — Mercado Pago usa un solo parámetro `scopes` separado por coma
  // (algunos integraciones usan parámetros individuales; usamos el formato estándar)
  const scopes = [
    'payments',
    'payments.read',
    'marketplace',
    'wallet_balance',
    'card',
    'card.read',
    'offline_access',
  ];
  authUrl.searchParams.set('scopes', scopes.join(','));

  // 4. Redirigir a Mercado Pago
  return NextResponse.redirect(authUrl.toString());
}

// ─────────────────────────────────────────────────────────────────────
// Helpers — OAuth state encoding
// ─────────────────────────────────────────────────────────────────────

async function buildOAuthState(payload: {
  sellerId: string;
  email: string | null;
  nonce: string;
  issuedAt: number;
}): Promise<string> {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64url');

  // HMAC signature usando SUPABASE_JWT_SECRET (mismo secreto que usa Supabase)
  const secret = process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? 'vendeya-dev-secret';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(base64));
  const sigB64 = Buffer.from(new Uint8Array(sig)).toString('base64url');
  return `${base64}.${sigB64}`;
}

export async function verifyOAuthState(state: string): Promise<{
  sellerId: string;
  email: string | null;
  nonce: string;
  issuedAt: number;
} | null> {
  const [base64, sigB64] = state.split('.');
  if (!base64 || !sigB64) return null;

  const secret = process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? 'vendeya-dev-secret';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const sigBuf = Buffer.from(sigB64, 'base64url');
  const ok = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(base64));
  if (!ok) return null;

  try {
    const json = Buffer.from(base64, 'base64url').toString('utf-8');
    const payload = JSON.parse(json);
    // Validar expiración: 10 minutos máximo
    const ageMin = (Date.now() - payload.issuedAt) / 60000;
    if (ageMin > 10) return null;
    return payload;
  } catch {
    return null;
  }
}
