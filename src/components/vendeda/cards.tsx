'use client'

import * as React from 'react'
import { Radio, Eye, Heart, Verified, Clock, Gavel } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatPEN, formatViewers, formatCountdown, initials, timeAgoEs } from '@/lib/vendeda/format'
import type { Auction, LiveStream, Product, Profile } from '@/lib/vendeda/types'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'

// =====================================================================
// AUCTION CARD — used in the marketplace grid
// =====================================================================
export function AuctionCard({ auction, className }: { auction: Auction; className?: string }) {
  const endsAtMs = auction.endsAt ? new Date(auction.endsAt).getTime() : null
  const secondsLeft = endsAtMs ? Math.max(0, Math.floor((endsAtMs - Date.now()) / 1000)) : 0
  const isEnding = secondsLeft > 0 && secondsLeft < 60
  const product = auction.product
  const seller = auction.seller

  return (
    <Link href={ROUTES.auction(auction.id)} className={cn('block', className)}>
      <Card className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-soft hover:shadow-lift transition-all duration-300 cursor-pointer h-full'
      )}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product?.images[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          {/* LIVE badge */}
          {auction.status === 'live' && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full glass px-2 py-0.5">
              <span className="live-dot" />
              <span className="text-[10px] font-bold text-white tracking-wide">EN VIVO</span>
            </div>
          )}
          {/* Time left */}
          {auction.status === 'live' && endsAtMs && (
            <div className={cn(
              'absolute top-2 right-2 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums',
              isEnding ? 'bg-salsa-500 text-white animate-pulse' : 'glass text-white'
            )}>
              <Clock className="inline h-2.5 w-2.5 mr-0.5" />
              {formatCountdown(secondsLeft)}
            </div>
          )}
          {/* Bottom gradient + current bid */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-white/70 leading-none">
                  {auction.status === 'live' ? 'Puja actual' : 'Precio'}
                </div>
                <div className="text-base font-bold text-white tabular-nums leading-tight">
                  {formatPEN(auction.currentPrice)}
                </div>
              </div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 glass border-0">
                <Gavel className="h-2.5 w-2.5 mr-0.5" />
                {auction.bidCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-salsa-700 transition-colors">
            {product?.title ?? 'Producto'}
          </h3>
          {seller && (
            <Link
              href={ROUTES.seller(seller.username)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
                <AvatarFallback className="text-[8px]">{initials(seller.displayName)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{seller.displayName}</span>
              {seller.isVerified && <Verified className="h-3 w-3 text-salsa-500 shrink-0" />}
            </Link>
          )}
        </div>
      </Card>
    </Link>
  )
}

// =====================================================================
// PRODUCT CARD — marketplace (no auction)
// =====================================================================
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const seller = product.seller
  return (
    <Link href={ROUTES.product(product.id)} className={cn('block', className)}>
      <Card className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-soft hover:shadow-lift transition-all duration-300 cursor-pointer h-full'
      )}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-[9px] glass border-0"
          >
            {product.condition === 'nuevo' ? 'Nuevo' : product.condition.split('-')[0]}
          </Badge>
        </div>
        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-salsa-700 transition-colors">
            {product.title}
          </h3>
          <div className="text-base font-bold text-salsa-700 tabular-nums">
            {formatPEN(product.basePrice, product.currency)}
          </div>
          {seller && (
            <Link
              href={ROUTES.seller(seller.username)}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
                  <AvatarFallback className="text-[8px]">{initials(seller.displayName)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{seller.displayName}</span>
                {seller.isVerified && <Verified className="h-3 w-3 text-salsa-500 shrink-0" />}
              </div>
              <span className="shrink-0">⭐ {seller.rating.toFixed(1)}</span>
            </Link>
          )}
        </div>
      </Card>
    </Link>
  )
}

// =====================================================================
// LIVE STREAM CARD — for the "Live now" rail
// =====================================================================
export function LiveStreamCard({ stream, className }: { stream: LiveStream; className?: string }) {
  const seller = stream.seller
  return (
    <Link href={ROUTES.stream(stream.id)} className={cn('block', className)}>
      <Card className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-soft hover:shadow-lift transition-all duration-300 cursor-pointer h-full w-full'
      )}>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {stream.thumbnailUrl && (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* LIVE badge */}
          {stream.isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full glass px-2 py-0.5">
              <span className="live-dot" />
              <span className="text-[10px] font-bold text-white tracking-wide">EN VIVO</span>
            </div>
          )}
          {/* Viewer count */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full glass px-2 py-0.5">
            <Eye className="h-2.5 w-2.5 text-white" />
            <span className="text-[10px] font-semibold text-white tabular-nums">
              {formatViewers(stream.viewerCount).replace(' espectadores', '').replace('Sin espectadores', '0')}
            </span>
          </div>

          {/* Bottom: title + seller */}
          <div className="absolute bottom-0 inset-x-0 p-2.5 space-y-1">
            <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">
              {stream.title}
            </p>
            {seller && (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 border border-white/20">
                  <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
                  <AvatarFallback className="text-[9px]">{initials(seller.displayName)}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-white/90 truncate">{seller.displayName}</span>
                {seller.isVerified && <Verified className="h-2.5 w-2.5 text-salsa-400 shrink-0" />}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

// =====================================================================
// SELLER CHIP — for the trending sellers rail
// =====================================================================
export function SellerChip({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <Link href={ROUTES.seller(profile.username)} className={cn('block', className)}>
      <div className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-card hover:shadow-soft transition-shadow cursor-pointer h-full w-full'
      )}>
        <div className="relative">
          <Avatar className="h-14 w-14 border-2 border-salsa-200">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.displayName} />
            <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
          </Avatar>
          {profile.isLiveSeller && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-salsa-500 text-white text-[8px] font-bold flex items-center gap-0.5">
              <Radio className="h-2 w-2" /> LIVE
            </span>
          )}
        </div>
        <div className="text-center">
          <div className="text-xs font-semibold flex items-center justify-center gap-0.5">
            <span className="truncate max-w-[80px]">{profile.displayName}</span>
            {profile.isVerified && <Verified className="h-3 w-3 text-salsa-500 shrink-0" />}
          </div>
          <div className="text-[10px] text-muted-foreground">
            ⭐ {profile.rating.toFixed(1)} · {profile.followerCount.toLocaleString('es-PE')}
          </div>
        </div>
      </div>
    </Link>
  )
}
