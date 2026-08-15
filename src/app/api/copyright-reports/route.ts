import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateReportBody {
  reporterEmail: string;
  targetSellerId: string;
  targetOrderOrStreamId: string;
  infringedBrand: string;
  evidenceUrl?: string;
}

/**
 * GET /api/copyright-reports
 * Lista reportes (solo admin). Sin auth admin retorna 403.
 */
export async function GET(request: Request) {
  const adminToken = request.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const reports = await db.copyrightReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: { targetSeller: true },
  });
  return NextResponse.json({ reports });
}

/**
 * POST /api/copyright-reports
 * Cualquiera puede reportar (formulario público en /reportar-infraccion).
 */
export async function POST(request: Request) {
  try {
    const body: CreateReportBody = await request.json();
    const { reporterEmail, targetSellerId, targetOrderOrStreamId, infringedBrand, evidenceUrl } =
      body;

    // Validaciones básicas
    if (!reporterEmail || !targetSellerId || !targetOrderOrStreamId || !infringedBrand) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
      return NextResponse.json(
        { error: 'reporterEmail no es un email válido.' },
        { status: 400 }
      );
    }

    // Verificar que el seller exista
    const seller = await db.sellerWallet.findUnique({
      where: { id: targetSellerId },
    });
    if (!seller) {
      return NextResponse.json(
        { error: 'El vendedor reportado no existe.' },
        { status: 404 }
      );
    }

    const report = await db.copyrightReport.create({
      data: {
        reporterEmail,
        targetSellerId,
        targetOrderOrStreamId,
        infringedBrand,
        evidenceUrl,
        status: 'pending',
      },
    });

    // TODO: Enviar email a moderación@vendeya.pe con el detalle
    // TODO: Si hay 3+ reportes pendientes contra el mismo seller → auto-suspender
    // TODO: Trigger de IA moderadora (DeepSeek-V4) para análisis preliminar

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message:
        'Reporte recibido. Nuestro equipo de moderación lo revisará en las próximas 24 horas.',
    });
  } catch (e) {
    console.error('[/api/copyright-reports POST] error:', e);
    return NextResponse.json(
      { error: 'No se pudo procesar el reporte.', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
