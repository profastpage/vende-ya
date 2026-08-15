import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/shalom
 *
 * Webhook de Shalom Perú: notifica cambios de estado del envío.
 *
 * Estados:
 *   - pending_dropoff → in_transit (vendedor dejó el paquete en agencia origen)
 *   - in_transit → ready_for_pickup (paquete llegó a agencia destino)
 *   - ready_for_pickup → delivered (comprador retiró el paquete)
 *
 * Al recibir 'delivered' → libera el escrow (pago al vendedor).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tracking_code, status } = body;

    if (!tracking_code || !status) {
      return NextResponse.json(
        { error: 'tracking_code y status requeridos' },
        { status: 400 }
      );
    }

    const shipment = await db.shalomShipment.findUnique({
      where: { trackingCode: tracking_code },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
    }

    // Validar transiciones válidas de estado
    const validTransitions: Record<string, string[]> = {
      pending_dropoff: ['in_transit'],
      in_transit: ['ready_for_pickup'],
      ready_for_pickup: ['delivered'],
      delivered: [],
    };
    if (!validTransitions[shipment.shipmentStatus]?.includes(status)) {
      return NextResponse.json(
        {
          error: `Transición inválida: ${shipment.shipmentStatus} → ${status}`,
        },
        { status: 400 }
      );
    }

    // Actualizar envío
    await db.shalomShipment.update({
      where: { id: shipment.id },
      data: { shipmentStatus: status },
    });

    // Si llegó a destino → liberar el escrow
    if (status === 'delivered' && shipment.order.paymentStatus === 'escrow_hold') {
      await db.order.update({
        where: { id: shipment.orderId },
        data: { paymentStatus: 'released' },
      });

      // TODO: Disparar notificación push al vendedor: "Pago liberado"
      // TODO: Disparar email al comprador: "Gracias por tu compra"
    }

    return NextResponse.json({ received: true, newStatus: status });
  } catch (e) {
    console.error('[/api/webhooks/shalom] error:', e);
    return NextResponse.json(
      { error: 'Webhook Shalom inválido', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
