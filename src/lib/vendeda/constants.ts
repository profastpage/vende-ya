/**
 * VENDE YA — App constants
 * Peruvian market defaults (PEN, Yape/Plin/PagoEfectivo, Olva, es-PE)
 * structured for clean i18n extension.
 */
import type { Category, PaymentMethodId, Locale } from './types'

export const APP_NAME = 'Vende Ya'
export const APP_TAGLINE_ES = 'Subastas en vivo. Compra ya. Vende ya.'
export const APP_TAGLINE_EN = 'Live auctions. Buy now. Sell now.'

export const DEFAULT_LOCALE: Locale = 'es-PE'
export const DEFAULT_CURRENCY = 'PEN' as const

/** Peruvian Sol currency formatter. */
export const PEN_FORMATTER = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** USD formatter (for fallback / international). */
export const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/** Compact number formatter (1.2K, 3.4M). */
export const COMPACT_FORMATTER = new Intl.NumberFormat('es-PE', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

// =====================================================================
// PAYMENT METHODS — Peruvian market
// =====================================================================
export const PAYMENT_METHODS: Record<
  PaymentMethodId,
  { id: PaymentMethodId; label: string; labelEn: string; color: string; icon: string }
> = {
  yape: {
    id: 'yape',
    label: 'Yape',
    labelEn: 'Yape',
    color: '#7B2C8C', // Yape purple
    icon: 'smartphone',
  },
  plin: {
    id: 'plin',
    label: 'Plin',
    labelEn: 'Plin',
    color: '#1DB5BE', // Plin teal
    icon: 'smartphone',
  },
  pagoefectivo: {
    id: ' pagoefectivo'.trim(),
    label: 'PagoEfectivo',
    labelEn: 'PagoEfectivo',
    color: '#FF5A1F', // Salsa
    icon: 'ticket',
  },
  card: {
    id: 'card',
    label: 'Tarjeta',
    labelEn: 'Card',
    color: '#0EA5E9',
    icon: 'credit-card',
  },
  transfer: {
    id: 'transfer',
    label: 'Transferencia',
    labelEn: 'Bank transfer',
    color: '#64748B',
    icon: 'building-2',
  },
}

// =====================================================================
// SHIPPING — Peruvian carriers
// =====================================================================
export const SHIPPING_CARRIERS = [
  { id: 'olva', label: 'Olva Courier', estDays: '1-3 días', color: '#E30613' },
  { id: 'shalom', label: 'Shalom', estDays: '1-2 días', color: '#F59E0B' },
  { id: 'marvisur', label: 'Marvisur', estDays: '2-4 días', color: '#16A34A' },
  { id: 'pickup', label: 'Recojo en tienda', estDays: 'Inmediato', color: '#64748B' },
] as const

// =====================================================================
// CATEGORIES — Marketplace taxonomy (es-PE primary)
// =====================================================================
export const CATEGORIES: Category[] = [
  { id: 'c1', slug: 'moda-mujer', nameEs: 'Moda Mujer', nameEn: 'Women Fashion', icon: 'shirt', color: 'salsa' },
  { id: 'c2', slug: 'moda-hombre', nameEs: 'Moda Hombre', nameEn: 'Men Fashion', icon: 'shirt', color: 'tambo' },
  { id: 'c3', slug: 'electronica', nameEs: 'Electrónica', nameEn: 'Electronics', icon: 'smartphone', color: 'lima' },
  { id: 'c4', slug: 'hogar', nameEs: 'Hogar', nameEn: 'Home', icon: 'home', color: 'salsa' },
  { id: 'c5', slug: 'belleza', nameEs: 'Belleza', nameEn: 'Beauty', icon: 'sparkles', color: 'plin' },
  { id: 'c6', slug: 'calzado', nameEs: 'Calzado', nameEn: 'Shoes', icon: 'footprints', color: 'lima' },
  { id: 'c7', slug: 'deportes', nameEs: 'Deportes', nameEn: 'Sports', icon: 'dumbbell', color: 'salsa' },
  { id: 'c8', slug: 'juguetes', nameEs: 'Juguetes', nameEn: 'Toys', icon: 'gamepad-2', color: 'plin' },
  { id: 'c9', slug: 'artesania', nameEs: 'Artesanía', nameEn: 'Handicraft', icon: 'palette', color: 'lima' },
  { id: 'c10', slug: 'gastronomia', nameEs: 'Gastronomía', nameEn: 'Food', icon: 'utensils', color: 'salsa' },
]

// =====================================================================
// DEPARTMENTS — Peru
// =====================================================================
export const PERU_DEPARTMENTS = [
  'Lima', 'Arequipa', 'La Libertad', 'Cusco', 'Piura', 'Lambayeque',
  'Junín', 'Áncash', 'Cajamarca', 'Loreto', 'Ayacucho', 'Ica', 'Puno',
  'Ucayali', 'Tacna', 'Tumbes', 'Moquegua', 'San Martín', 'Huánuco',
  'Pasco', 'Madre de Dios', 'Apurímac', 'Amazonas', 'Huancavelica',
] as const

// =====================================================================
// STREAM CONFIG
// =====================================================================
export const STREAM_CONFIG = {
  defaultDuration: 180,             // 3-minute auctions by default
  bidIncrementMin: 1,               // S/ 1.00 min step
  bidIncrementPct: 0.05,            // 5% of current price as default step
  maxConcurrentBidders: 500,
  chatRateLimitPerMin: 30,          // 30 msgs/min/user
  reactionRateLimitPerMin: 120,
  aiModerationBatchMs: 250,         // batch messages for AI every 250ms
  bidLockMs: 800,                   // optimistic UI lock to prevent double-bid
} as const

// =====================================================================
// AI EDGE — model routing
// =====================================================================
export const AI_EDGE = {
  moderationModel: 'deepseek-v4-fast',
  assistantModel: 'qwen-2.5-72b-instruct',
  moderationMaxTokens: 64,
  assistantMaxTokens: 256,
  moderationThreshold: 0.7,         // score >= 0.7 -> auto-hide
  competitorUrlPatterns: [
    /mercadoli\w*\.com\.pe/i,
    /aliexpress\.com/i,
    /amazon\.com(\.mx|\.br|\.pe)?/i,
    /facebook\.com\/marketplace/i,
    /shopee\.com\.pe/i,
  ],
  profanityEs: ['puta', 'puto', 'mierda', 'estúpido', 'estupido', 'idiota', 'cabron', 'pendejo'],
} as const

// =====================================================================
// CLOUDFLARE — config constants
// =====================================================================
export const CLOUDFLARE = {
  stream: {
    lowLatencyMode: true,
    cacheTtl: 30,
    adaptiveBitrate: ['240p', '480p', '720p', '1080p'],
  },
  r2: {
    signedUrlTtlSec: 600,
    maxImageSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxVideoSizeBytes: 2 * 1024 * 1024 * 1024, // 2 GB VOD
  },
} as const
