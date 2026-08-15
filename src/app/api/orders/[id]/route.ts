import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[id]
 * Devuelve una orden con su envío asociado y el desglose financiero completo.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { shipment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      order,
      breakdown: {
        total: order.totalAmount,
        platformCommissionRate: order.platformCommissionRate,
        platformCommissionAmount: order.platformCommissionAmount,
        gatewayCost: order.gatewayFeeAmount,
        sellerNet: order.sellerNetAmount,
      },
      shipment: order.shipment,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Error al consultar la orden', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
