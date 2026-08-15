/**
 * VENDE YA — Mercado Pago gateway adapter
 * =====================================================================
 * Sprint 2-A — Implementación real de callGatewaySplit().
 *
 * Modo A — Split automático:
 *   - Comprador paga el monto total a Vende Ya (collector)
 *   - Vende Ya retiene su comisión (12% en vivo / 8% marketplace)
 *   - Vende Ya paga al vendedor el neto (transferencia interna MP)
 *
 * Implementación:
 *   1. Crear `payment` con `application_fee` = comisión de la plataforma
 *   2. `collector.id` = NEXT_PUBLIC_MP_COLLECTOR_ID (la cuenta de Vende Ya)
 *   3. `marketplace_fee` = split automático
 *   4. Para Yape/Plin: usar `payment_method_id = "yape"` o `"plin"`
 *
 * En modo demo (sin MP_ACCESS_TOKEN), simula el cobro y devuelve un ID mock.
 *
 * Endpoints usados:
 *   - POST https://api.mercadopago.com/v1/payments           (crear cobro)
 *   - GET  https://api.mercadopago.com/v1/payments/{id}      (status)
 *   - POST https://api.mercadopago.com/merchant_orders       (orden marketplace)
 *
 * Para QR dinámico Yape/Plin:
 *   - POST https://api.mercadopago.com/v1/payments con payment_method_id="yape"
 *     devuelve `point_of_interaction.transaction_data.qr_code` (string del QR)
 *     y `qr_code_base64` (imagen lista para mostrar)
 * =====================================================================
 */
import type { PaymentMethod } from '@/lib/vendeda/payments';

export interface GatewaySplitParams {
  gatewayToken: string; // Token de tarjeta / Yape / Plin del comprador
  totalAmount: number;
  paymentMethod: PaymentMethod;
  platformCommissionAmount: number; // Lo que se queda Vende Ya
  gatewaySellerId: string; // user_id de MP del vendedor
  orderId?: string;
  buyerEmail?: string;
}

export interface GatewaySplitResult {
  transactionId: string;
  status: 'approved' | 'pending' | 'rejected' | 'in_process';
  qrCode?: string; // String para renderizar QR
  qrCodeBase64?: string; // Imagen QR lista para mostrar
  deepLink?: string; // Para abrir Yape/Plin app en móvil
  paymentId?: number; // ID interno de Mercado Pago
  raw?: unknown;
}

const MP_BASE_URL = 'https://api.mercadopago.com';

const isConfigured = () => Boolean(
  process.env.MP_ACCESS_TOKEN || process.env.MP_CLIENT_SECRET
);

const isDemoMode = () => !isConfigured();

// Mapeo Vende Ya → Mercado Pago payment_method_id
const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  yape: 'yape',
  plin: 'plin',
  pago_efectivo: 'pagoefectivo_atm',
  credit_card: 'credit_card',
};

/**
 * Crea un pago split en Mercado Pago (Modo A).
 *
 * @returns { transactionId, status, qrCode? }
 */
export async function callGatewaySplit(
  params: GatewaySplitParams
): Promise<GatewaySplitResult> {
  if (isDemoMode()) {
    return simulatePayment(params);
  }

  const accessToken = process.env.MP_ACCESS_TOKEN!;
  const collectorId = process.env.MP_COLLECTOR_ID ?? process.env.NEXT_PUBLIC_MP_COLLECTOR_ID;

  // 1. Construir payload del pago
  const mpPaymentMethod = PAYMENT_METHOD_MAP[params.paymentMethod];
  const isQRMethod = params.paymentMethod === 'yape' || params.paymentMethod === 'plin';

  const payload: Record<string, unknown> = {
    transaction_amount: params.totalAmount,
    description: `Venta Vende Ya · Orden ${params.orderId ?? ''}`,
    payment_method_id: mpPaymentMethod,
    payer: {
      email: params.buyerEmail ?? 'comprador@vendeya.pe',
      // Para Yape/Plin: Mercado Pago generará el QR dinámico basado en el monto
    },
    // Split Modo A — Vende Ya retiene la comisión automáticamente
    application_fee: params.platformCommissionAmount,
    // `collector` es la cuenta de Vende Ya (marketplace)
    ...(collectorId ? { collector_id: Number(collectorId) } : {}),
    // Metadatos para auditoría
    metadata: {
      platform: 'vendeya',
      seller_id: params.gatewaySellerId,
      order_id: params.orderId,
      // Modo A breakdown
      commission: params.platformCommissionAmount,
      seller_net: params.totalAmount - params.platformCommissionAmount,
    },
    // Para métodos que no requieren token (Yape, Plin, PagoEfectivo)
    // Si es tarjeta, el token viene en `params.gatewayToken`
    ...(params.paymentMethod === 'credit_card'
      ? { token: params.gatewayToken }
      : {}),
    // Para Yape/Plin: pedir QR dinámico
    ...(isQRMethod
      ? {
          point_of_interaction: {
            type: 'CHECKOUT',
            sub_type: 'QR',
          },
        }
      : {}),
    statement_descriptor: 'VENDEYA',
    external_reference: params.orderId ?? `vendeya-${Date.now()}`,
  };

  // 2. Crear pago
  const res = await fetch(`${MP_BASE_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': params.orderId ?? crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[MercadoPago] Payment creation failed:', data);
    throw new Error(
      data.message ?? `Mercado Pago rechazó el pago (HTTP ${res.status}).`
    );
  }

  // 3. Extraer QR si es Yape/Plin
  const qr = data.point_of_interaction?.transaction_data;
  return {
    transactionId: String(data.id),
    paymentId: data.id,
    status: data.status, // approved | pending | rejected | in_process
    qrCode: qr?.qr_code,
    qrCodeBase64: qr?.qr_code_base64,
    deepLink: qr?.ticket_url,
    raw: data,
  };
}

/**
 * Consulta el estado de un pago en Mercado Pago.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<GatewaySplitResult['status'] | null> {
  if (isDemoMode()) {
    return 'approved';
  }
  const accessToken = process.env.MP_ACCESS_TOKEN!;
  const res = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.status;
}

// ─────────────────────────────────────────────────────────────────────
// DEMO MODE — simula respuesta de Mercado Pago
// ─────────────────────────────────────────────────────────────────────

function simulatePayment(params: GatewaySplitParams): GatewaySplitResult {
  const isQR = params.paymentMethod === 'yape' || params.paymentMethod === 'plin';
  const transactionId = `MP-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // Para Yape/Plin: simular QR con un string de "deep link"
  const fakeQr = isQR
    ? `00020101021226980014vendeya.pe0114${transactionId}5204000053036045802PE5910VENDE YA DEMO6009LIMA6304${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`
    : undefined;

  return {
    transactionId,
    paymentId: Math.floor(Math.random() * 1_000_000_000),
    status: 'approved',
    qrCode: fakeQr,
    qrCodeBase64: fakeQr
      ? `data:image/svg+xml;base64,${Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" font-size="10" text-anchor="middle" fill="black">${fakeQr.slice(0, 20)}...</text></svg>`
        ).toString('base64')}`
      : undefined,
    deepLink: isQR ? `yape://pay?amount=${params.totalAmount}&ref=${transactionId}` : undefined,
    raw: { demo: true, params },
  };
}
