import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  calculateSplit,
  assertWalletReady,
  type OrderSource,
  type PaymentMethod,
} from '@/lib/vendeda/payments';
import { shalomClient } from '@/lib/vendeda/shalom';
import { getAuthenticatedUser } from '@/lib/vendeda/supabase-server';
import { callGatewaySplit } from '@/lib/vendeda/gateway/mercadopago';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  // buyerId is now OVERRIDDEN by the verified JWT user — clients cannot spoof it.
  buyerId?: string;
  sellerId: string;
  productId?: string;
  source: OrderSource;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  gatewayToken: string;
  shipment?: {
    originAgencyId: string;
    destinationAgencyId: string;
    senderDni: string;
    senderName: string;
    senderPhone: string;
    receiverDni: string;
    receiverName: string;
    receiverPhone: string;
    packageDescription: string;
    weightKg: number;
    declaredValue: number;
  };
}

/**
 * POST /api/checkout
 * =====================================================================
 * Sprint 2-B — Checkout blindado:
 *  1. Verifica el JWT del comprador (Authorization: Bearer xxx o cookie sb-*)
 *  2. buyerId se TOMA del token verificado, no del body
 *  3. Calcula split Modo A
 *  4. Valida wallet del vendedor
 *  5. Cobra en pasarela (mock hasta Sprint 2-A)
 *  6. Inserta orden en Supabase/Postgres via Prisma
 *  7. Crea Shalom shipment si aplica → transición a escrow_hold
 *
 * Respuestas HTTP:
 *   200 — checkout exitoso (con o sin envío)
 *   401 — token ausente o inválido
 *   400 — validación falló (wallet no activa, monto inválido, etc.)
 *   500 — error interno
 */
export async function POST(request: Request) {
  try {
    // =================================================================
    // 1. AUTENTICACIÓN BLINDADA — Verify JWT
    // =================================================================
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError ?? 'Acceso denegado.' },
        { status: 401 }
      );
    }
    const buyerId = user.id; // Sobrescribe cualquier buyerId del body

    // =================================================================
    // 2. PARSEO Y VALIDACIÓN DE CAMPOS
    // =================================================================
    const body: CheckoutRequest = await request.json();
    const { sellerId, source, totalAmount, paymentMethod, gatewayToken, shipment } = body;

    if (!sellerId || !source || !totalAmount || !paymentMethod || !gatewayToken) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos en el checkout.' },
        { status: 400 }
      );
    }
    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'totalAmount debe ser un número positivo.' },
        { status: 400 }
      );
    }
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: 'El comprador y el vendedor no pueden ser el mismo usuario.' },
        { status: 400 }
      );
    }
    // Validar tipos de enum
    if (source !== 'live_stream' && source !== 'marketplace') {
      return NextResponse.json(
        { error: `source inválido: '${source}'. Esperado 'live_stream' o 'marketplace'.` },
        { status: 400 }
      );
    }
    const VALID_PAYMENT_METHODS: PaymentMethod[] = ['yape', 'plin', 'pago_efectivo', 'credit_card'];
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: `paymentMethod inválido: '${paymentMethod}'.` },
        { status: 400 }
      );
    }

    // =================================================================
    // 3. SPLIT MODO A (cálculo puro)
    // =================================================================
    const split = calculateSplit({ totalAmount, source });

    // =================================================================
    // 4. WALLET DEL VENDEDOR
    // =================================================================
    const sellerWallet = await db.sellerWallet.findUnique({
      where: { id: sellerId },
    });
    if (!sellerWallet) {
      return NextResponse.json(
        { error: 'El vendedor no tiene una wallet registrada en Vende Ya.' },
        { status: 400 }
      );
    }
    try {
      assertWalletReady(sellerWallet);
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 }
      );
    }

    // =================================================================
    // 5. PASARELA — Split de Mercado Pago (Modo A)
    // =================================================================
    // Sprint 2-A: usa el adapter real. En modo demo (sin MP_ACCESS_TOKEN)
    // el adapter simula el cobro y devuelve un QR mock para Yape/Plin.
    let gatewayResult;
    try {
      gatewayResult = await callGatewaySplit({
        gatewayToken,
        totalAmount,
        paymentMethod,
        platformCommissionAmount: split.platformCommissionAmount,
        gatewaySellerId: sellerWallet.gatewaySellerId,
        orderId: undefined, // se setea después de crear la orden
        buyerEmail: user.email ?? undefined,
      });
    } catch (e) {
      console.error('[/api/checkout] Gateway call failed:', e);
      return NextResponse.json(
        {
          error:
            'Mercado Pago rechazó el pago. Verifica tus datos o intenta con otro método.',
          detail: (e as Error).message,
        },
        { status: 402 }
      );
    }
    const gatewayTransactionId = gatewayResult.transactionId;

    // =================================================================
    // 6. INSERTAR ORDEN EN DB (buyerId verificado del JWT)
    // =================================================================
    const order = await db.order.create({
      data: {
        buyerId,
        sellerId,
        source,
        totalAmount,
        platformCommissionRate: split.platformCommissionRate,
        platformCommissionAmount: split.platformCommissionAmount,
        gatewayFeeAmount: split.gatewayFeeWithIgv,
        sellerNetAmount: split.sellerNetAmount,
        paymentStatus: 'paid',
        paymentMethod,
        gatewayTransactionId,
      },
    });

    // =================================================================
    // 7. SHALOM SHIPMENT (opcional) → escrow_hold
    // =================================================================
    let shipmentInfo: { trackingCode: string; pdfLabelUrl: string; shippingCost: number } | null = null;
    if (shipment) {
      try {
        const shalomResult = await shalomClient.createShipment({
          originAgencyId: shipment.originAgencyId,
          destinationAgencyId: shipment.destinationAgencyId,
          senderDni: shipment.senderDni,
          senderName: shipment.senderName,
          senderPhone: shipment.senderPhone,
          receiverDni: shipment.receiverDni,
          receiverName: shipment.receiverName,
          receiverPhone: shipment.receiverPhone,
          packageDescription: shipment.packageDescription,
          weightKg: shipment.weightKg,
          declaredValue: shipment.declaredValue,
          orderId: order.id,
        });

        await db.shalomShipment.create({
          data: {
            orderId: order.id,
            trackingCode: shalomResult.trackingCode,
            originAgencyId: shipment.originAgencyId,
            destinationAgencyId: shipment.destinationAgencyId,
            senderDni: shipment.senderDni,
            receiverDni: shipment.receiverDni,
            shippingCost: shalomResult.shippingCost,
            shipmentStatus: 'pending_dropoff',
            pdfLabelurl: shalomResult.pdfLabelUrl,
          },
        });

        // Transición a escrow_hold — el pago se retiene hasta delivered
        await db.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'escrow_hold' },
        });

        shipmentInfo = {
          trackingCode: shalomResult.trackingCode,
          pdfLabelurl: shalomResult.pdfLabelUrl,
          shippingCost: shalomResult.shippingCost,
        };
      } catch (e) {
        console.error('[/api/checkout] Shalom createShipment failed:', e);
        // El pago ya se procesó — no fallar el checkout completo.
        return NextResponse.json(
          {
            success: true,
            orderId: order.id,
            warning:
              'Pago procesado pero falló la creación del envío Shalom. Contactar soporte con el orderId.',
            breakdown: split,
          },
          { status: 200 }
        );
      }
    }

    // =================================================================
    // 8. RESPUESTA
    // =================================================================
    return NextResponse.json({
      success: true,
      message: 'Pago procesado exitosamente. Comisiones distribuidas en la fuente.',
      orderId: order.id,
      buyer: { id: buyerId, email: user.email },
      breakdown: {
        total: split.totalAmount,
        platformCommission: split.platformCommissionAmount,
        gatewayCost: split.gatewayFeeWithIgv,
        sellerNet: split.sellerNetAmount,
      },
      gateway: {
        transactionId: gatewayResult.transactionId,
        status: gatewayResult.status,
        // Para Yape/Plin: devolver QR para que el frontend lo muestre
        qrCode: gatewayResult.qrCode,
        qrCodeBase64: gatewayResult.qrCodeBase64,
        deepLink: gatewayResult.deepLink,
      },
      shipment: shipmentInfo,
    });
  } catch (error: any) {
    console.error('[/api/checkout] error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al procesar el checkout.' },
      { status: 500 }
    );
  }
}
