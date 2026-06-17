/**
 * VENDE YA — Formatting helpers (PEN currency, relative time, etc.)
 */
import { PEN_FORMATTER, USD_FORMATTER, COMPACT_FORMATTER, DEFAULT_CURRENCY } from './constants'
import type { Currency } from './types'

/** Format an amount as PEN currency. S/. 1,234.50 */
export function formatPEN(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
  if (currency === 'USD') return USD_FORMATTER.format(amount)
  return PEN_FORMATTER.format(amount).replace('PEN', 'S/.').trim()
}

/** Compact formatter: 1.2K, 3.4M viewers */
export function formatCompact(n: number): string {
  return COMPACT_FORMATTER.format(n)
}

/** Format viewer count with fallback for 0. */
export function formatViewers(n: number): string {
  if (n < 1) return 'Sin espectadores'
  if (n === 1) return '1 espectador'
  if (n < 1000) return `${n} espectadores`
  return `${formatCompact(n)} espectadores`
}

/** Seconds -> mm:ss for countdown timers. */
export function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return '00:00'
  const m = Math.floor(secondsLeft / 60)
  const s = Math.floor(secondsLeft % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Time ago in Spanish (es-PE). */
export function timeAgoEs(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 60) return 'hace unos segundos'
  if (min < 60) return `hace ${min} min`
  if (hr < 24)  return `hace ${hr} h`
  if (day < 7)  return `hace ${day} días`
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

/** Get initials from a display name (for avatars). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

/** Truncate text to N chars with ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

/** Compute the suggested next bid given current price + increment. */
export function nextBid(currentPrice: number, increment: number): number {
  return Math.round((currentPrice + increment) * 100) / 100
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Validate a Peruvian phone number (9 digits starting with 9). */
export function isValidPeruvianPhone(phone: string): boolean {
  return /^9\d{8}$/.test(phone.replace(/\s|-/g, ''))
}
