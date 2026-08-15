import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  calculateSplit,
  assertWalletReady,
  generateMockTransactionId,
  type OrderSource,
  type PaymentMethod,
} from '@/lib/vendeda/payments';
import { shalomClient } from '@/lib/vendeda/shalom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  buyerId: string;
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
 * Procesa compra bajo Modo A: calcula split → valida wallet → cobra en pasarela
 * → registra orden → crea shipment Shalom si aplica → pasa a escrow_hold.
 */
export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();
    const { buyerId, sellerId, source, totalAmount, paymentMethod, gatewayToken, shipment } =
      body;

    if (!buyerId || !sellerId || !source || !totalAmount || !paymentMethod || !gatewayToken) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos en el checkout.' },
        { status: 400 }
      );
    }
    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'totalAmount debe ser positivo.' }, { status: 400 });
    }
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: 'El comprador y el vendedor no pueden ser el mismo usuario.' },
        { status: 400 }
      );
    }

    // 1. Calcular split de comisiones (Modo A)
    const split = calculateSplit({ totalAmount, source });

    // 2. Validar wallet del vendedor
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

    // 3. Llamar a la pasarela (split automático)
    const gatewayTransactionId =
      process.env.NODE_ENV === 'production'
        ? await callGatewaySplit({
            gatewayToken,
            totalAmount,
            paymentMethod,
            platformCommissionAmount: split.platformCommissionAmount,
            gatewaySellerId: sellerWallet.gatewaySellerId,
          })
        : generateMockTransactionId();

    // 4. Registrar la orden en DB
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

    // 5. Si requiere envío físico → crear Shalom shipment
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
            pdfLabelUrl: shalomResult.pdfLabelUrl,
          },
        });

        // Pasar a escrow_hold hasta que el envío se entregue
        await db.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'escrow_hold' },
        });

        shipmentInfo = {
          trackingCode: shalomResult.trackingCode,
          pdfLabelUrl: shalomResult.pdfLabelUrl,
          shippingCost: shalomResult.shippingCost,
        };
      } catch (e) {
        console.error('Shalom createShipment failed:', e);
        return NextResponse.json(
          {
            success: true,
            orderId: order.id,
            warning:
              'Pago procesado pero falló la creación del envío Shalom. Contactar soporte.',
            breakdown: split,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pago procesado exitosamente y comisiones distribuidas en la fuente.',
      orderId: order.id,
      breakdown: {
        total: split.totalAmount,
        platformCommission: split.platformCommissionAmount,
        gatewayCost: split.gatewayFeeWithIgv,
        sellerNet: split.sellerNetAmount,
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

async function callGatewaySplit(params: {
  gatewayToken: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  platformCommissionAmount: number;
  gatewaySellerId: string;
}): Promise<string> {
  // TODO: Implementar con SDK de Mercado Pago / Culqi cuando esté el contrato
  return generateMockTransactionId();
}
