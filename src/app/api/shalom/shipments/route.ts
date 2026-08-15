import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { shalomClient } from '@/lib/vendeda/shalom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/shalom/shipments?tracking=ABC123
 * Rastrea un envío por tracking code y sincroniza el estado con la DB local.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tracking = searchParams.get('tracking');
  const orderId = searchParams.get('orderId');

  if (!tracking && !orderId) {
    return NextResponse.json(
      { error: 'Se requiere ?tracking= o ?orderId=' },
      { status: 400 }
    );
  }

  try {
    const shipment = await db.shalomShipment.findFirst({
      where: tracking ? { trackingCode: tracking } : { orderId: orderId! },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Envío no encontrado.' }, { status: 404 });
    }

    // Sincronizar estado desde Shalom (best-effort, no falla si la API está caída)
    try {
      if (shipment.trackingCode) {
        const fresh = await shalomClient.getShipmentStatus(shipment.trackingCode);
        if (fresh.status !== shipment.shipmentStatus) {
          await db.shalomShipment.update({
            where: { id: shipment.id },
            data: { shipmentStatus: fresh.status },
          });
          shipment.shipmentStatus = fresh.status;

          // Si llegó a destino → liberar el escrow de la orden
          if (fresh.status === 'delivered' && shipment.order.paymentStatus === 'escrow_hold') {
            await db.order.update({
              where: { id: shipment.orderId },
              data: { paymentStatus: 'released' },
            });
            shipment.order.paymentStatus = 'released';
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo sincronizar el estado desde Shalom:', e);
    }

    return NextResponse.json({ shipment });
  } catch (e) {
    return NextResponse.json(
      { error: 'Error al consultar el envío.', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
