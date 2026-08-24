import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/vendeda/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/seller/dashboard
 *
 * Sprint 2-B — Endpoint protegido con JWT.
 *   - Verifica el token del usuario (Authorization: Bearer o cookie)
 *   - sellerId puede omitirse — se toma del JWT verificado
 *
 * Devuelve todos los datos que el dashboard del vendedor necesita en 1 request:
 *   - Wallet (estado, verificación, gatewaySellerId)
 *   - Últimas 20 órdenes (con desglose de comisiones)
 *   - Envíos Shalom pendientes de dropoff
 *   - Reportes de copyright contra el vendedor (si los hay)
 *   - Alertas de moderación (account status, KYC faltante, etc.)
 */
export async function GET(request: Request) {
  // 1. Autenticación blindada
  const { user, error: authError } = await getAuthenticatedUser(request);
  if (authError || !user) {
    return NextResponse.json(
      { error: authError ?? 'No autenticado.' },
      { status: 401 }
    );
  }

  // 2. sellerId: priorizar query param (para admins), si no, usar el del JWT
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') ?? user.id;

  const wallet = await db.sellerWallet.findUnique({
    where: { id: sellerId },
    include: {
      ordersSeller: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { shipment: true },
      },
      copyrightReports: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      ordersBuyer: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { shipment: true, review: true, seller: true },
      },
    },
  });

  let reviews = [];
  try {
    reviews = await db.review.findMany({
      where: { revieweeId: sellerId },
      include: { reviewer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  } catch (e) { console.error("Review fetch error", e); }

  let notifications = [];
  try {
    notifications = await db.notification.findMany({
      where: { userId: sellerId },
      orderBy: { createdAt: 'desc' },
      take: 6
    });
  } catch (e) { console.error("Notification fetch error", e); }


  if (!wallet) {
    // Si el usuario es el propio vendedor y no tiene wallet, ofrecer crearla
    return NextResponse.json(
      {
        error: 'Vendedor no encontrado.',
        needsOnboarding: sellerId === user.id,
      },
      { status: 404 }
    );
  }

  // Calcular resumen financiero (últimas 20 órdenes)
  const summary = {
    totalSales: wallet.ordersSeller.reduce((s, o) => s + o.totalAmount, 0),
    totalCommissions: wallet.ordersSeller.reduce((s, o) => s + o.platformCommissionAmount, 0),
    totalGatewayFees: wallet.ordersSeller.reduce((s, o) => s + o.gatewayFeeAmount, 0),
    totalNet: wallet.ordersSeller.reduce((s, o) => s + o.sellerNetAmount, 0),
    pendingEscrow: wallet.ordersSeller
      .filter((o) => o.paymentStatus === 'escrow_hold')
      .reduce((s, o) => s + o.sellerNetAmount, 0),
  };

  // Alertas de moderación
  const alerts: Array<{ level: 'info' | 'warning' | 'critical'; message: string }> = [];
  if (!wallet.isVerified) {
    alerts.push({
      level: 'warning',
      message: 'Tu cuenta no está verificada (KYC pendiente). No podrás recibir cobros.',
    });
  }
  if (wallet.status === 'suspended') {
    alerts.push({
      level: 'critical',
      message: 'Tu cuenta está suspendida. Contacta soporte para reactivarla.',
    });
  }
  if (wallet.status === 'banned') {
    alerts.push({
      level: 'critical',
      message:
        'Tu cuenta fue baneada por infracción de propiedad intelectual. Tienes derecho a apelar.',
    });
  }
  if (wallet.copyrightReports.length > 0) {
    const pending = wallet.copyrightReports.filter((r) => r.status === 'pending').length;
    if (pending > 0) {
      alerts.push({
        level: pending >= 3 ? 'critical' : 'warning',
        message: `Tienes ${pending} reporte(s) de propiedad intelectual pendientes de revisión.`,
      });
    }
  }

  // Envíos pendientes de dropoff (necesitan acción del vendedor)
  const pendingDropoffs = wallet.ordersSeller
    .flatMap((o) => (o.shipment ? [{ order: o, shipment: o.shipment }] : []))
    .filter((x) => x.shipment.shipmentStatus === 'pending_dropoff');

  return NextResponse.json({
    wallet: {
      id: wallet.id,
      gatewaySellerId: wallet.gatewaySellerId,
      isVerified: wallet.isVerified,
      status: wallet.status,
    },
    summary,
    recentOrders: wallet.ordersSeller,
    pendingDropoffs,
    copyrightReports: wallet.copyrightReports,
    alerts,
      reviews,
      notifications,
    });
}
