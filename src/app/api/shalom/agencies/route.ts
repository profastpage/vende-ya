import { NextResponse } from 'next/server';
import { shalomClient } from '@/lib/vendeda/shalom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/shalom/agencies
 * Lista todas las agencias Shalom (cacheable 24h en edge).
 */
export async function GET() {
  try {
    const agencies = await shalomClient.listAgencies();
    return NextResponse.json({
      mode: shalomClient.mode,
      count: agencies.length,
      agencies,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo obtener la lista de agencias Shalom.', detail: (e as Error).message },
      { status: 502 }
    );
  }
}
