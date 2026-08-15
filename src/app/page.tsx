'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Radio, TrendingUp, Flame, ChevronRight, Sparkles, Zap, ChevronLeft,
  Share2, Link2, Check, Eye, Gavel, ShoppingBag, BadgeCheck, ArrowRight,
  Play, Crown, Star, Heart, Users, Package, TrendingDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiveBiddingContainer } from '@/components/vendeda/LiveBiddingContainer'
import { SectionNav, ScrollToTopButton, SECTIONS } from '@/components/vendeda/SectionNav'
import { QuickAuctionFab } from '@/components/vendeda/QuickAuctionFab'
import {
  AuctionCard, ProductCard, LiveStreamCard, SellerChip,
} from '@/components/vendeda/cards'
import { useToast } from '@/hooks/use-toast'
import {
  MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_PRODUCTS,
  MOCK_STREAMS, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers } from '@/lib/vendeda/format'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

/* ---------------------------------------------------------------- */
/* Ultra Inmersiva — Dark Premium Homepage                           */
/* TikTok-style hero + bento grid + neon accents + glassmorphism     */
/* ---------------------------------------------------------------- */

function HeroStatPill({
  icon: Icon, label, value, accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
      <Icon className={`h-3.5 w-3.5 ${accent}`} />
      <span className="text-[11px] text-zinc-400 font-medium">{label}</span>
      <span className="text-xs font-bold text-white tabular-nums">{value}</span>
    </div>
  )
}

function BentoKpi({
  icon: Icon, label, value, delta, accent, gradient,
}: {
  icon: React.ElementType
  label: string
  value: string
  delta?: string
  accent: string
  gradient: string
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-xl p-4 md:p-5"
    >
      {/* glow */}
      <div
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{ background: gradient }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{label}</p>
          <p className="mt-1 text-2xl md:text-3xl font-black text-white tabular-nums">{value}</p>
          {delta && (
            <p className={`mt-1 text-[11px] font-bold ${accent}`}>{delta}</p>
          )}
        </div>
        <div className="rounded-xl p-2 bg-white/5 border border-white/10">
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
      </div>
    </motion.div>
  )
}

function LiveRailCard({ stream }: { stream: typeof MOCK_STREAMS[number] }) {
  return (
    <Link href={`/en-vivo/${stream.id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-2xl bg-zinc-900 aspect-[3/4] border border-white/5"
      >
        {/* Thumbnail */}
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${stream.thumbnailUrl ?? ''})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/90 backdrop-blur-md border border-rose-300/30">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
        </div>

        {/* Viewers */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Eye className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] font-bold text-white tabular-nums">
            {formatViewers(stream.viewerCount)}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
            {stream.title}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-[9px] font-bold text-white">
              {stream.seller?.displayName?.[0] ?? 'V'}
            </div>
            <span className="text-[10px] text-zinc-300 truncate">
              {stream.seller?.displayName}
            </span>
            {stream.seller?.isVerified && (
              <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function ProductBentoCard({ product, index }: { product: typeof MOCK_PRODUCTS[number], index: number }) {
  const stockPercent = Math.min(100, Math.max(0, ((product.stock ?? 0) / 50) * 100))
  const stockColor = stockPercent < 25 ? 'bg-rose-500' : stockPercent < 60 ? 'bg-amber-400' : 'bg-lime-400'
  const isNew = index < 3
  const isOffer = index % 4 === 2

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm"
    >
      {/* Image */}
      <Link href={ROUTES.marketplace} className="block relative aspect-square overflow-hidden bg-zinc-950">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 text-[9px] font-black tracking-wider">
              NUEVO
            </span>
          )}
          {isOffer && (
            <span className="px-2 py-0.5 rounded-md bg-fuchsia-500 text-white text-[9px] font-black tracking-wider">
              OFERTA
            </span>
          )}
        </div>

        {/* Like button */}
        <button className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center group/like">
          <Heart className="h-3.5 w-3.5 text-zinc-300 group-hover/like:text-rose-400 transition-colors" />
        </button>
      </Link>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs font-semibold text-white line-clamp-2 leading-tight min-h-[2rem]">
          {product.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-black text-amber-400 tabular-nums">
            {formatPEN(product.basePrice ?? 0)}
          </span>
          <span className="text-[10px] text-zinc-500">
            Stock: {product.stock ?? 0}
          </span>
        </div>
        {/* Stock pressure bar */}
        <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full ${stockColor} transition-all duration-500`}
            style={{ width: `${stockPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function AuctionBentoCard({ auction }: { auction: typeof MOCK_TRENDING_AUCTIONS[number] }) {
  const [secs, setSecs] = React.useState(180)
  React.useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl p-4 border border-fuchsia-500/20"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(34,19,94,0.6) 50%, rgba(9,9,11,0.95) 100%)',
      }}
    >
      {/* glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-fuchsia-500/30 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
          {auction.product?.images?.[0] && (
            <img
              src={auction.product.images[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <Gavel className="h-3 w-3 text-fuchsia-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">
              Subasta en vivo
            </span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-1">
            {auction.product?.title}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[10px] text-zinc-400">Puja actual</span>
            <span className="text-base font-black text-amber-400 tabular-nums">
              {formatPEN(auction.currentPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/15 border border-rose-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold text-rose-300 tabular-nums">{mm}:{ss}</span>
        </div>
        <Link
          href={ROUTES.live}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[11px] font-bold flex items-center gap-1"
        >
          Pujar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const [activeCategory, setActiveCategory] = React.useState('all')
  const liveStreams = MOCK_STREAMS.filter((s) => s.isLive)

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 dark">
      {/* SectionNav: sticky-top, debajo del header móvil/desktop.
          Debe estar ANTES del main para que el sticky funcione en todo el scroll. */}
      <SectionNav />

      {/* pb-28: espacio seguro inferior para que el contenido pase por detrás
          del MobileBottomNav fijo (h-16 + safe-area) sin colisionar ni cortarse */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-4 pb-28 md:pb-12">

        {/* ============================================================= */}
        {/* HERO — TikTok-style full-bleed with glassmorphism overlays     */}
        {/* ============================================================= */}
        <section
          id="hero"
          aria-label="Subasta en vivo destacada"
          className="mb-6 md:mb-10 scroll-mt-32 md:scroll-mt-20"
        >
          {/* Hero background image */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5">
            {/* BG image */}
            {MOCK_AUCTION.product?.images?.[0] && (
              <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${MOCK_AUCTION.product.images[0]})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/95 via-zinc-950/70 to-fuchsia-950/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />

            {/* Floating stats */}
            <div className="absolute top-3 md:top-5 right-3 md:right-5 flex flex-wrap gap-2 justify-end">
              <HeroStatPill
                icon={Eye}
                label="Espectadores"
                value={formatViewers(MOCK_AUCTION.stream?.viewerCount ?? 0)}
                accent="text-amber-400"
              />
              <HeroStatPill
                icon={Flame}
                label="Pujas"
                value={String(MOCK_BIDS.length)}
                accent="text-rose-400"
              />
              <HeroStatPill
                icon={Gavel}
                label="Actual"
                value={formatPEN(MOCK_AUCTION.currentPrice)}
                accent="text-fuchsia-400"
              />
            </div>

            <div className="relative px-5 md:px-10 py-10 md:py-16 max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-md border border-rose-300/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[11px] font-bold text-white tracking-wider">EN VIVO AHORA</span>
                </span>
                <span className="px-2 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-wider">
                  <Flame className="inline h-3 w-3 mr-1" />TRENDING
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight drop-shadow-2xl">
                {MOCK_AUCTION.product?.title}
              </h1>

              <p className="mt-3 text-sm md:text-base text-zinc-300 max-w-xl">
                Subasta en vivo con{' '}
                <span className="font-bold text-white">
                  {MOCK_AUCTION.seller?.displayName}
                </span>{' '}
                · {formatViewers(MOCK_AUCTION.stream?.viewerCount ?? 0)} espectadores · Paga con{' '}
                <span className="text-amber-400 font-semibold">Yape</span>{' / '}
                <span className="text-cyan-400 font-semibold">Plin</span>
              </p>

              {/* Seller chip */}
              <div className="mt-5 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 w-fit">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center text-sm font-black text-white">
                  {MOCK_AUCTION.seller?.displayName?.[0] ?? 'V'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white">
                      {MOCK_AUCTION.seller?.displayName}
                    </span>
                    {MOCK_AUCTION.seller?.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-sky-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">Vendedor verificado · Lima, PE</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/en-vivo/${MOCK_AUCTION.stream?.id ?? 's1'}`}>
                  <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-shadow">
                    <Play className="h-4 w-4 fill-current" /> Unirse a la subasta
                  </button>
                </Link>
                <Link href={ROUTES.marketplace}>
                  <button className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold text-sm flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <ShoppingBag className="h-4 w-4" /> Explorar marketplace
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* BENTO KPIs — solo desktop (mobile queda más limpio/imersivo)    */}
        {/* ============================================================= */}
        <section className="hidden md:grid mb-8 grid-cols-4 gap-4">
          <BentoKpi
            icon={Radio}
            label="En vivo ahora"
            value={String(liveStreams.length)}
            delta="+2 vs. ayer"
            accent="text-rose-400"
            gradient="linear-gradient(135deg, #f43f5e, #ec4899)"
          />
          <BentoKpi
            icon={Gavel}
            label="Subastas abiertas"
            value={String(MOCK_TRENDING_AUCTIONS.length)}
            delta="3 cierran <5min"
            accent="text-fuchsia-400"
            gradient="linear-gradient(135deg, #d946ef, #a855f7)"
          />
          <BentoKpi
            icon={Package}
            label="Productos activos"
            value={String(MOCK_PRODUCTS.length)}
            delta="+12 esta semana"
            accent="text-amber-400"
            gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"
          />
          <BentoKpi
            icon={Users}
            label="Vendedores top"
            value={String(MOCK_PROFILES.length)}
            delta="+4 nuevos hoy"
            accent="text-lime-400"
            gradient="linear-gradient(135deg, #84cc16, #22c55e)"
          />
        </section>

        {/* ============================================================= */}
        {/* SELLERS — Trending                                             */}
        {/* ============================================================= */}
        <section id="sellers" className="mb-8 md:mb-10 scroll-mt-32 md:scroll-mt-20">
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg md:text-xl font-black text-white font-display">
                Vendedores en tendencia
              </h2>
            </div>
            <Link href={`${ROUTES.marketplace}?filter=sellers`}>
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Ver todos <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {MOCK_PROFILES.slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className="shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm min-w-[100px]"
              >
                <div className="relative">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 p-0.5">
                    <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center text-xl font-black text-white">
                      {p.displayName?.[0] ?? 'V'}
                    </div>
                  </div>
                  {i === 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center">
                      <Crown className="h-3 w-3 text-zinc-950" />
                    </div>
                  )}
                  {p.isVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-sky-400 bg-zinc-950 rounded-full" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white truncate max-w-[90px]">{p.displayName}</p>
                  <p className="text-[10px] text-zinc-500">@{p.username ?? p.id}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* LIVE RAIL — Streams en vivo                                    */}
        {/* ============================================================= */}
        <section id="live-rail" className="mb-8 md:mb-10 scroll-mt-32 md:scroll-mt-20">
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-500/15 border border-rose-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              </span>
              <h2 className="text-lg md:text-xl font-black text-white font-display">
                En vivo ahora
              </h2>
              <span className="text-xs text-zinc-500">
                {liveStreams.length} transmisiones
              </span>
            </div>
            <Link href={ROUTES.live}>
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Ver todo <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0">
            {liveStreams.slice(0, 3).map((s) => (
              <LiveRailCard key={s.id} stream={s} />
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* AUCTIONS BENTO — Active auctions                               */}
        {/* ============================================================= */}
        <section id="auctions" className="mb-8 md:mb-10 scroll-mt-32 md:scroll-mt-20">
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-fuchsia-400" />
              <h2 className="text-lg md:text-xl font-black text-white font-display">
                Subastas activas
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30">
                <Sparkles className="h-3 w-3 text-fuchsia-400" />
                <span className="text-[10px] font-bold text-fuchsia-300">AI moderado</span>
              </span>
            </div>
            <Link href={ROUTES.live}>
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Ver todo <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {MOCK_TRENDING_AUCTIONS.slice(0, 3).map((a) => (
              <AuctionBentoCard key={a.id} auction={a} />
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* PRODUCTS BENTO GRID                                            */}
        {/* ============================================================= */}
        <section id="products" className="mb-8 md:mb-10 scroll-mt-32 md:scroll-mt-20">
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg md:text-xl font-black text-white font-display">
                Productos del marketplace
              </h2>
            </div>
            <Link href={ROUTES.marketplace}>
              <button className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Ver todo <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {MOCK_PRODUCTS.slice(0, 6).map((p, i) => (
              <ProductBentoCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* PAYMENTS STRIP                                                 */}
        {/* ============================================================= */}
        <section className="mb-8 md:mb-10 rounded-3xl border border-white/5 overflow-hidden">
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-fuchsia-950/40 via-zinc-900 to-amber-950/30">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg md:text-xl font-black text-white">
                  Paga en segundos, 24/7
                </h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4 max-w-xl">
                Integrado con Mercado Pago. Subastas con escrow automático y logística Shalom a todo Perú.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'yape',  label: 'Yape',          color: '#7B2C8C' },
                  { id: 'plin',  label: 'Plin',          color: '#00B4D8' },
                  { id: 'pagof', label: 'PagoEfectivo',  color: '#FF5A1F' },
                  { id: 'card',  label: 'Tarjeta',       color: '#64748B' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl px-3 py-2 text-xs font-bold backdrop-blur-md"
                    style={{
                      backgroundColor: `${p.color}30`,
                      color: '#fff',
                      border: `1px solid ${p.color}`,
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* ARCHITECTURE                                                   */}
        {/* ============================================================= */}
        <section
          id="architecture"
          aria-label="Arquitectura del MVP"
          className="hidden md:block mt-12 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 scroll-mt-20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-black text-white font-display">
              MVP Core Bootstrap — Architecture
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl p-3 bg-white/5 border border-white/5">
              <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> Frontend
              </div>
              <p className="text-zinc-400">
                Next.js 16 App Router · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion. Mobile-first, safe-area aware.
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/5 border border-white/5">
              <div className="font-bold text-fuchsia-400 mb-1 flex items-center gap-1.5">
                <Radio className="h-3 w-3" /> Real-time
              </div>
              <p className="text-zinc-400">
                Socket.io mini-service (port 3003) for bids + chat. In prod: Supabase Realtime replication.
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/5 border border-white/5">
              <div className="font-bold text-lime-400 mb-1 flex items-center gap-1.5">
                <Package className="h-3 w-3" /> Database
              </div>
              <p className="text-zinc-400">
                Supabase PostgreSQL with RLS on every user-generated table. <code className="text-amber-400">place_bid()</code> RPC prevents race conditions.
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/5 border border-white/5">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> AI Edge
              </div>
              <p className="text-zinc-400">
                DeepSeek-V4 (moderation) + Qwen-2.5-72B (sales assistant) via z-ai-web-dev-sdk. Rule-based prefilter at zero token cost.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Scroll-to-top FAB (después de main para que no sea sticky) */}
      <ScrollToTopButton />
      <QuickAuctionFab />

      {/* Footer */}
      <footer
        id="footer"
        className="hidden md:block mt-auto border-t border-white/5 bg-zinc-950 scroll-mt-20"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Vende Ya"
              width={24}
              height={24}
              priority
              className="rounded-md object-contain"
            />
            <span>© 2026 Vende Ya · Hecho en Perú 🇵🇪</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.terminos} className="hover:text-amber-400 transition-colors">Términos</Link>
            <Link href={ROUTES.privacidad} className="hover:text-amber-400 transition-colors">Privacidad</Link>
            <Link href={ROUTES.soporte} className="hover:text-amber-400 transition-colors">Soporte</Link>
            <Link href={ROUTES.envios} className="hover:text-amber-400 transition-colors">Olva tracking</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
