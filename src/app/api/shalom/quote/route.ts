import { NextResponse } from 'next/server';
import { shalomClient } from '@/lib/vendeda/shalom';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface QuoteRequest {
  originAgencyId: string;
  destinationAgencyId: string;
  weightKg: number;
  declaredValue: number;
}

/**
 * POST /api/shalom/quote
 * Cotiza el costo de envío entre dos agencias.
 */
export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();
    const { originAgencyId, destinationAgencyId, weightKg, declaredValue } = body;

    if (!originAgencyId || !destinationAgencyId) {
      return NextResponse.json(
        { error: 'originAgencyId y destinationAgencyId son requeridos.' },
        { status: 400 }
      );
    }
    if (weightKg <= 0 || declaredValue < 0) {
      return NextResponse.json(
        { error: 'weightKg debe ser positivo y declaredValue no negativo.' },
        { status: 400 }
      );
    }

    const quote = await shalomClient.quoteShipment({
      originAgencyId,
      destinationAgencyId,
      weightKg,
      declaredValue,
    });

    return NextResponse.json({ quote });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo cotizar el envío.', detail: (e as Error).message },
      { status: 500 }
    );
  }
}
