import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/copyright-reports/[id]/ban
 * Ejecuta el baneo del vendedor asociado al reporte.
 * Marca el reporte como 'resolved_ban' y suspende la wallet del vendedor.
 *
 * Requiere header x-admin-token = ADMIN_API_TOKEN (solo admin/moderación).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminToken = request.headers.get('x-admin-token');
    if (adminToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id: reportId } = await params;

    const report = await db.copyrightReport.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }
    if (report.status === 'resolved_ban') {
      return NextResponse.json({ error: 'El vendedor ya fue baneado por este reporte' }, { status: 409 });
    }

    // 1. Suspender wallet del vendedor (congela splits de pago)
    await db.sellerWallet.update({
      where: { id: report.targetSellerId },
      data: {
        isVerified: false,
        status: 'banned',
      },
    });

    // 2. Marcar reporte como resuelto-baneo
    await db.copyrightReport.update({
      where: { id: reportId },
      data: { status: 'resolved_ban' },
    });

    // 3. Cancelar órdenes pendientes del vendedor baneado
    await db.order.updateMany({
      where: {
        sellerId: report.targetSellerId,
        paymentStatus: { in: ['pending', 'escrow_hold'] },
      },
      data: { paymentStatus: 'refunded' },
    });

    // TODO: Notificar al vendedor por email + push: "Tu cuenta fue suspendida por infracción de PI"
    // TODO: Notificar al reportante: "Tu reporte fue resuelto, el vendedor fue baneado"
    // TODO: Cancelar streams en vivo del vendedor (marcar is_live=false)

    return NextResponse.json({
      success: true,
      message: 'Vendedor baneado exitosamente. Órdenes pendientes marcadas como reembolsadas.',
      bannedSellerId: report.targetSellerId,
    });
  } catch (e) {
    console.error('[/api/copyright-reports/[id]/ban] error:', e);
    return NextResponse.json(
      { error: 'No se pudo ejecutar el baneo', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
