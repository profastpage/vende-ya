/**
 * Vende Ya — Cliente de API Shalom Perú
 * =====================================================================
 * Shalom es una empresa de transporte de encomiendas agencia-a-agencia
 * muy usada para despachos entre provincias en Perú.
 *
 * Documentación oficial: https://www.shalom.com.pe (pequeña empresa, API
 * normalmente contratada via cuenta empresarial — envía DNI de remitente,
 * DNI de destinatario, agencia origen y destino).
 *
 * Este cliente está diseñado para funcionar en 3 modos:
 *   1. Producción: requiere SHALOM_API_KEY + SHALOM_BASE_URL en env
 *   2. Sandbox: usa SHALOM_BASE_URL=sandbox y respuestas mock realistas
 *   3. Demo: si no hay credenciales, simula respuestas para dev local
 * =====================================================================
 */

export interface ShalomAgency {
  id: string;
  name: string;
  address: string;
  department: string;
  province: string;
  district: string;
  latitude?: number;
  longitude?: number;
}

export interface ShalomQuoteRequest {
  originAgencyId: string;
  destinationAgencyId: string;
  weightKg: number;
  declaredValue: number;
}

export interface ShalomQuote {
  shippingCost: number;
  estimatedDeliveryDays: number;
  currency: 'PEN';
}

export interface ShalomShipmentCreate {
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
  orderId: string;
}

export interface ShalomShipmentCreated {
  trackingCode: string;
  pdfLabelUrl: string;
  shippingCost: number;
  status: 'pending_dropoff';
}

const SHALOM_BASE_URL =
  process.env.SHALOM_BASE_URL ?? 'https://api.shalom.com.pe/v1';
const SHALOM_API_KEY = process.env.SHALOM_API_KEY ?? '';
const SHALOM_MODE: 'prod' | 'sandbox' | 'demo' =
  SHALOM_API_KEY && process.env.SHALOM_BASE_URL
    ? 'prod'
    : process.env.SHALOM_BASE_URL?.includes('sandbox')
      ? 'sandbox'
      : 'demo';

/**
 * Lista todas las agencias Shalom disponibles, agrupadas por departamento.
 * Cacheable 24h (las agencias no cambian frecuentemente).
 */
export async function listAgencies(): Promise<ShalomAgency[]> {
  if (SHALOM_MODE === 'demo' || SHALOM_MODE === 'sandbox') {
    return mockAgencies();
  }
  const res = await fetch(`${SHALOM_BASE_URL}/agencies`, {
    headers: { Authorization: `Bearer ${SHALOM_API_KEY}` },
    next: { revalidate: 86400 }, // cache 24h
  });
  if (!res.ok) throw new Error(`Shalom listAgencies: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Cotiza el costo de envío entre dos agencias.
 */
export async function quoteShipment(req: ShalomQuoteRequest): Promise<ShalomQuote> {
  if (SHALOM_MODE === 'demo' || SHALOM_MODE === 'sandbox') {
    // Tarifa base S/. 8 + S/. 2 por kg + 1% del valor declarado (seguro)
    const base = 8;
    const perKg = 2 * Math.max(req.weightKg, 0.5);
    const insurance = req.declaredValue * 0.01;
    const cost = Number((base + perKg + insurance).toFixed(2));
    return {
      shippingCost: cost,
      estimatedDeliveryDays: req.originAgencyId.startsWith('LIM') &&
        req.destinationAgencyId.startsWith('LIM')
        ? 1
        : 2,
      currency: 'PEN',
    };
  }
  const res = await fetch(`${SHALOM_BASE_URL}/quotes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SHALOM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Shalom quote: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Crea el envío en Shalom y devuelve la guía (tracking_code + PDF URL).
 * Este método debe llamarse DESPUÉS de que el pago esté confirmado.
 */
export async function createShipment(
  payload: ShalomShipmentCreate
): Promise<ShalomShipmentCreated> {
  if (SHALOM_MODE === 'demo' || SHALOM_MODE === 'sandbox') {
    const trackingCode = `SHALOM-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    return {
      trackingCode,
      pdfLabelUrl: `https://demo.vendeya.pe/labels/${trackingCode}.pdf`,
      shippingCost: (await quoteShipment({
        originAgencyId: payload.originAgencyId,
        destinationAgencyId: payload.destinationAgencyId,
        weightKg: payload.weightKg,
        declaredValue: payload.declaredValue,
      })).shippingCost,
      status: 'pending_dropoff',
    };
  }
  const res = await fetch(`${SHALOM_BASE_URL}/shipments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SHALOM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Shalom createShipment failed: ${res.status} ${errText}`);
  }
  return res.json();
}

/**
 * Consulta el estado de un envío por tracking code.
 * Usado por el webhook interno para sincronizar estados.
 */
export async function getShipmentStatus(trackingCode: string): Promise<{
  status: 'pending_dropoff' | 'in_transit' | 'ready_for_pickup' | 'delivered';
  updatedAt: string;
}> {
  if (SHALOM_MODE === 'demo' || SHALOM_MODE === 'sandbox') {
    return { status: 'pending_dropoff', updatedAt: new Date().toISOString() };
  }
  const res = await fetch(`${SHALOM_BASE_URL}/shipments/${trackingCode}`, {
    headers: { Authorization: `Bearer ${SHALOM_API_KEY}` },
    next: { revalidate: 60 }, // cache 1 min
  });
  if (!res.ok) throw new Error(`Shalom status: ${res.status}`);
  return res.json();
}

/**
 * Mock realista de agencias Shalom Perú.
 * Sirve para demo y sandbox.
 */
function mockAgencies(): ShalomAgency[] {
  return [
    { id: 'LIM-01', name: 'Shalom Lima Centro', address: 'Av. Tacna 800', department: 'Lima', province: 'Lima', district: 'Cercado' },
    { id: 'LIM-02', name: 'Shalom Lima Norte', address: 'Av. Universitaria 1500', department: 'Lima', province: 'Lima', district: 'Los Olivos' },
    { id: 'LIM-03', name: 'Shalom Lima Sur', address: 'Av. Benavides 2500', department: 'Lima', province: 'Lima', district: 'Surco' },
    { id: 'ARE-01', name: 'Shalom Arequipa Centro', address: 'Av. Cayma 402', department: 'Arequipa', province: 'Arequipa', district: 'Cercado' },
    { id: 'TRU-01', name: 'Shalom Trujillo', address: 'Av. América Sur 3014', department: 'La Libertad', province: 'Trujillo', district: 'Trujillo' },
    { id: 'CJR-01', name: 'Shalom Cajamarca', address: 'Av. Atahualpa 700', department: 'Cajamarca', province: 'Cajamarca', district: 'Cajamarca' },
    { id: 'PIU-01', name: 'Shalom Piura', address: 'Av. Sánchez Cerro 1200', department: 'Piura', province: 'Piura', district: 'Piura' },
    { id: 'CUZ-01', name: 'Shalom Cusco', address: 'Av. de la Cultura 700', department: 'Cusco', province: 'Cusco', district: 'Cusco' },
  ];
}

export const shalomClient = {
  listAgencies,
  quoteShipment,
  createShipment,
  getShipmentStatus,
  mode: SHALOM_MODE,
};
