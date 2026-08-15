/**
 * Vende Ya — Motor de Pagos (Modo A: vendedor absorbe todos los costos financieros)
 * =====================================================================
 * Reglas de negocio:
 *   - Comisión Vende Ya: 12% en vivo, 8% marketplace
 *   - Comisión Pasarela: 3.9% + IGV (18%) sobre el total de la orden
 *   - Fórmula: Neto = Total - Comisión Plataforma - Costo Pasarela con IGV
 *
 * Toda la lógica financiera vive aquí para que sea unit-testeable y
 * consistente entre checkout, webhooks, dashboard y reportes contables.
 * =====================================================================
 */

export type OrderSource = 'live_stream' | 'marketplace';
export type PaymentMethod = 'yape' | 'plin' | 'credit_card' | 'pago_efectivo';
export type PaymentStatus = 'pending' | 'paid' | 'escrow_hold' | 'released' | 'refunded';

export interface CommissionRates {
  /** 0.12 para vivo, 0.08 para marketplace */
  platform: number;
  /** Tasa base de la pasarela sin IGV (ej. 0.039 para 3.9%) */
  gatewayBase: number;
  /** IGV peruano sobre servicios financieros (0.18) */
  igvRate: number;
}

export const DEFAULT_RATES: CommissionRates = {
  platform: 0.12, // se sobreescribe según source
  gatewayBase: 0.039,
  igvRate: 0.18,
};

export const PLATFORM_RATE: Record<OrderSource, number> = {
  live_stream: 0.12,
  marketplace: 0.08,
};

export interface SplitBreakdown {
  totalAmount: number;
  platformCommissionRate: number; // 12.00 o 8.00 (porcentaje, no fracción)
  platformCommissionAmount: number;
  gatewayBaseFee: number;
  gatewayFeeWithIgv: number;
  sellerNetAmount: number;
}

/**
 * Calcula el split de pagos bajo Modo A.
 *
 * @example
 * const split = calculateSplit({ totalAmount: 100, source: 'live_stream' });
 * // split.platformCommissionAmount === 12.00
 * // split.gatewayFeeWithIgv === 4.60
 * // split.sellerNetAmount === 83.40
 */
export function calculateSplit(params: {
  totalAmount: number;
  source: OrderSource;
  rates?: Partial<CommissionRates>;
}): SplitBreakdown {
  const { totalAmount, source } = params;

  if (totalAmount < 0 || !Number.isFinite(totalAmount)) {
    throw new Error('totalAmount debe ser un número positivo');
  }

  const platformRate = PLATFORM_RATE[source];
  const gatewayBaseRate = params.rates?.gatewayBase ?? DEFAULT_RATES.gatewayBase;
  const igvRate = params.rates?.igvRate ?? DEFAULT_RATES.igvRate;

  const platformCommissionAmount = round2(totalAmount * platformRate);
  const gatewayBaseFee = round2(totalAmount * gatewayBaseRate);
  const gatewayFeeWithIgv = round2(gatewayBaseFee * (1 + igvRate));
  const sellerNetAmount = round2(totalAmount - platformCommissionAmount - gatewayFeeWithIgv);

  // Sanity check — el vendedor nunca debe recibir más que el total
  if (sellerNetAmount > totalAmount) {
    throw new Error('Inconsistencia en el split: sellerNet > totalAmount');
  }

  return {
    totalAmount,
    platformCommissionRate: platformRate * 100, // 12.00 o 8.00
    platformCommissionAmount,
    gatewayBaseFee,
    gatewayFeeWithIgv,
    sellerNetAmount,
  };
}

/**
 * Valida que una wallet de vendedor esté activa y verificada para recibir
 * cobros. Lanza error descriptivo si no es válida.
 */
export function assertWalletReady(wallet: {
  gatewaySellerId: string | null;
  isVerified: boolean;
  status: string;
}): void {
  if (!wallet.gatewaySellerId) {
    throw new Error(
      'El vendedor no ha configurado o vinculado su cuenta de cobros.'
    );
  }
  if (!wallet.isVerified) {
    throw new Error(
      'El vendedor aún no ha completado la verificación KYC de su cuenta de cobros.'
    );
  }
  if (wallet.status === 'suspended') {
    throw new Error('La cuenta del vendedor está temporalmente suspendida.');
  }
  if (wallet.status === 'banned') {
    throw new Error(
      'La cuenta del vendedor fue baneada por infracción de propiedad intelectual.'
    );
  }
}

/**
 * Redondea a 2 decimales usando banker's rounding (consistente con PEN).
 */
function round2(n: number): number {
  return Number(n.toFixed(2));
}

/**
 * Formatea un monto en PEN (Sol peruano) para mostrar al usuario.
 */
export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Genera un ID de transacción mock para entorno no-producción.
 * En prod, este ID viene del webhook de la pasarela (Mercado Pago / Culqi).
 */
export function generateMockTransactionId(): string {
  return `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}
