'use client'

/**
 * VENDE YA — Flaticon Uicons wrapper
 * =====================================================================
 * Flaticon Uicons are free (CC BY 4.0 — attribution required).
 * We load them via their official CDN in layout.tsx, then use this
 * component for type-safe access.
 *
 * Attribution: "Icons made by Flaticon (https://www.flaticon.com)"
 *
 * Usage:
 *   <Flaticon name=" FiChat" variant="regular" />
 *
 * Variant:
 *   - "regular"  → outline / line icons (default)
 *   - "solid"    → filled
 *   - "brands"   → brand logos (Yape, Plin, WhatsApp, etc.)
 * =====================================================================
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

export type FlaticonVariant = 'regular' | 'solid' | 'brands'

export interface FlaticonProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string           // e.g. "fi-rr-chat" (regular), "fi-sr-chat" (solid), "fi-brands-whatsapp"
  variant?: FlaticonVariant
  size?: number          // px
}

const VARIANT_PREFIX: Record<FlaticonVariant, string> = {
  regular: 'fi-rr-',
  solid: 'fi-sr-',
  brands: 'fi-brands-',
}

export function Flaticon({
  name,
  variant = 'regular',
  size = 16,
  className,
  style,
  ...rest
}: FlaticonProps) {
  // If user passed full name like "fi-rr-chat", use it as-is
  const fullClass = name.startsWith('fi-') ? name : `${VARIANT_PREFIX[variant]}${name}`
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center justify-center leading-none', fullClass, className)}
      style={{ fontSize: size, width: size, height: size, ...style }}
      {...rest}
    />
  )
}

// =====================================================================
// Pre-built brand badges for Peruvian payment methods
// =====================================================================
export function YapeIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <Flaticon name="fi-brands-whatsapp" variant="brands" size={size} className={className} />
}

/** WhatsApp click-to-chat icon (brand). */
export function WhatsAppIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <Flaticon name="fi-brands-whatsapp" variant="brands" size={size} className={className} />
}

/** Instagram icon (brand). */
export function InstagramIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <Flaticon name="fi-brands-instagram" variant="brands" size={size} className={className} />
}

/** TikTok icon (brand) — relevant for live sellers. */
export function TikTokIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <Flaticon name="fi-brands-tik-tok" variant="brands" size={size} className={className} />
}
