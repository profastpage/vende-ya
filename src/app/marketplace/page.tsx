'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Flame, Eye, Heart, BadgeCheck, Radio, Package, Users,
  Filter, X, Sparkles, ChevronRight,
} from 'lucide-react'
import {
  MOCK_PRODUCTS, MOCK_PROFILES, MOCK_STREAMS, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import type { Product, Profile } from '@/lib/vendeda/types'

/* ------------------------------------------------------------------ */
/* Dark Stream Hub — Marketplace "Ultra Inmersiva"                      */
/* Pure dark (bg-zinc-950) · glassmorphism · neon accents · bento     */
/* ------------------------------------------------------------------ */

type FilterId = 'all' | 'live' | 'new' | 'offer' | 'top'

const FILTERS: Array<{
  id: FilterId
  label: string
  icon: React.ElementType
  accent?: 'live' | 'default'
}> = [
  { id: 'all',   label: 'Todo',     icon: Sparkles },
  { id: 'live',  label: 'En vivo',  icon: Radio,    accent: 'live' },
  { id: 'new',   label: 'Nuevo',     icon: Flame },
  { id: 'offer', label: 'Oferta',    icon: Filter },
  { id: 'top',   label: 'Top',       icon: Users },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/* ────────────────────────────────────────────────────────────────── */
/* Hero KPI banner — glassmorphism card with 3 glowing stats         */
/* ────────────────────────────────────────────────────────────────── */
function HeroKpiBanner({
  liveCount, productCount, topSeller,
}: {
  liveCount: number
  productCount: number
  topSeller: Profile
}) {
  const stats: Array<{
    icon: React.ElementType
    label: string
    value: string
    sub: string
    accent: string
    glow: string
  }> = [
    {
      icon: Radio,
      label: 'En vivo ahora',
      value: String(liveCount),
      sub: `${formatViewers(
        MOCK_STREAMS.filter((s) => s.isLive).reduce((a, s) => a + s.viewerCount, 0),
      )}`,
      accent: 'text-rose-300',
      glow: 'linear-gradient(135deg, #f43f5e, #ec4899)',
    },
    {
      icon: Package,
      label: 'Productos activos',
      value: String(productCount),
      sub: 'Envíos a todo Perú',
      accent: 'text-amber-300',
      glow: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    },
    {
      icon: Users,
      label: 'Vendedores top',
      value: topSeller.displayName.split(' ')[0],
      sub: `⭐ ${topSeller.rating.toFixed(1)} · ${topSeller.salesCount} ventas`,
      accent: 'text-fuchsia-300',
      glow: 'linear-gradient(135deg, #d946ef, #a855f7)',
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 md:p-6"
      aria-label="Resumen del marketplace en vivo"
    >
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
        {/* Heading block */}
        <div className="md:pr-6 md:mr-6 md:border-r md:border-white/10 md:max-w-[34%]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase">
                Dark Stream Hub
              </span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white leading-tight tracking-tight">
            Marketplace en vivo
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
            Compra en subastas en tiempo real, descubre productos de
            vendedores verificados y paga con Yape o Plin en segundos.
            Cada venta es protegida con escrow automático.
          </p>
        </div>

        {/* KPIs */}
        <div className="flex-1 grid grid-cols-3 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              className={`relative flex flex-col gap-1.5 px-3 md:px-4 ${
                i < stats.length - 1 ? 'md:border-r md:border-white/10' : ''
              }`}
            >
              <div
                className="absolute -top-6 right-0 h-16 w-16 rounded-full blur-2xl opacity-40"
                style={{ background: s.glow }}
              />
              <div className="relative flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <s.icon className={`h-3.5 w-3.5 ${s.accent}`} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                  {s.label}
                </span>
              </div>
              <p className="relative text-xl md:text-2xl font-black text-white tabular-nums leading-none mt-0.5">
                {s.value}
              </p>
              <p className="relative text-[10px] text-zinc-400 leading-tight truncate">
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Filter chip                                                        */
/* ────────────────────────────────────────────────────────────────── */
function FilterChip({
  active, label, icon: Icon, accent, onClick,
}: {
  active: boolean
  label: string
  icon: React.ElementType
  accent?: 'live' | 'default'
  onClick: () => void
}) {
  const base =
    'shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border transition-all'
  const activeCls =
    accent === 'live'
      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
      : 'bg-amber-400 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
  const inactive = 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
  return (
    <button onClick={onClick} className={`${base} ${active ? activeCls : inactive}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Product bento card — the heart of the marketplace                  */
/* ────────────────────────────────────────────────────────────────── */
function ProductBentoCard({
  product, index, isOfferItem, isLiveItem,
}: {
  product: Product
  index: number
  isOfferItem: boolean
  isLiveItem: boolean
}) {
  const [liked, setLiked] = React.useState(false)
  const seller: Profile = product.seller ?? MOCK_PROFILES[index % MOCK_PROFILES.length]
  const isNew = index < 3

  // Stock pressure: derive a stable 0-100 from product.stock + index
  const stockPercent = Math.min(
    100,
    Math.max(6, Math.round(((product.stock ?? 1) / 50) * 100) + (index % 7)),
  )
  const stockColor =
    stockPercent < 25 ? 'bg-rose-500' : stockPercent < 60 ? 'bg-amber-400' : 'bg-lime-400'
  const stockLabel =
    stockPercent < 25
      ? `¡Solo ${product.stock}!`
      : stockPercent < 60
        ? `Stock bajo · ${product.stock}u`
        : `${product.stock} disponibles`

  // Offer math: fake original price 1.3x base, discount pct
  const originalPrice = isOfferItem ? Math.round(product.basePrice * 1.3) : null
  const discountPct = isOfferItem
    ? Math.round(((originalPrice! - product.basePrice) / originalPrice!) * 100)
    : 0

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="group relative bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/10 transition-colors"
    >
      {/* Image */}
      <Link
        href={ROUTES.product(product.id)}
        className="block relative aspect-square overflow-hidden bg-zinc-950"
        aria-label={product.title}
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-xs font-bold">
            [ Imagen ]
          </div>
        )}

        {/* Gradient overlay for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-zinc-950/30" />

        {/* Floating badges (top-left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-zinc-950 text-[9px] font-black tracking-wider uppercase shadow-lg shadow-amber-500/30">
              Nuevo
            </span>
          )}
          {isOfferItem && (
            <span className="px-1.5 py-0.5 rounded-md bg-fuchsia-500 text-white text-[9px] font-black tracking-wider uppercase shadow-lg shadow-fuchsia-500/30">
              Oferta
            </span>
          )}
          {discountPct > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black tracking-wider uppercase shadow-lg shadow-rose-500/30">
              -{discountPct}%
            </span>
          )}
          {isLiveItem && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/90 text-white text-[9px] font-black tracking-wider uppercase shadow-lg shadow-rose-500/30">
              <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Like button (top-right) */}
        <button
          type="button"
          aria-label="Me gusta"
          onClick={(e) => {
            e.preventDefault()
            setLiked((v) => !v)
          }}
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors hover:bg-black/70"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-300'
            }`}
          />
        </button>

        {/* Viewer badge if live */}
        {isLiveItem && (
          <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <Eye className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-white tabular-nums">
              {formatViewers(
                MOCK_STREAMS.find((s) => s.sellerId === seller.id && s.isLive)?.viewerCount ?? 0,
              ).replace(' espectadores', '')}
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-2.5 md:p-3">
        {/* Seller chip */}
        <Link
          href={ROUTES.seller(seller.username)}
          className="flex items-center gap-1.5 mb-1.5 min-w-0"
        >
          <Image
            src="/logo.png"
            alt={seller.displayName}
            width={16}
            height={16}
            className="rounded-full shrink-0 object-cover"
          />
          <span className="text-[10px] text-zinc-400 font-medium truncate">
            {seller.displayName}
          </span>
          {seller.isVerified && (
            <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />
          )}
        </Link>

        {/* Title */}
        <h3 className="text-xs font-semibold text-white line-clamp-2 leading-snug min-h-[2.4em]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-base font-black text-amber-400 tabular-nums">
            {formatPEN(product.basePrice)}
          </span>
          {originalPrice && (
            <span className="text-[10px] text-zinc-500 line-through tabular-nums">
              {formatPEN(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock pressure bar */}
        <div className="mt-2">
          <div className="h-[3px] w-full rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stockPercent}%` }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.04, ease: 'easeOut' }}
              className={`h-full ${stockColor} rounded-full`}
            />
          </div>
          <p
            className={`mt-1 text-[9px] font-bold ${
              stockPercent < 25 ? 'text-rose-400' : 'text-zinc-500'
            }`}
          >
            {stockLabel}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Live auction mini-card — fuchsia gradient for visual variety       */
/* ────────────────────────────────────────────────────────────────── */
function AuctionMiniCard({
  auction, index,
}: {
  auction: typeof MOCK_TRENDING_AUCTIONS[number]
  index: number
}) {
  const endsAtMs = auction.endsAt ? new Date(auction.endsAt).getTime() : Date.now() + 600000
  const secondsLeft = Math.max(60, Math.floor((endsAtMs - Date.now()) / 1000))
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl p-3 border border-fuchsia-500/20"
      style={{
        background:
          'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(34,19,94,0.6) 50%, rgba(9,9,11,0.95) 100%)',
      }}
    >
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
      <Link
        href={ROUTES.auction(auction.id)}
        className="relative flex items-start gap-2.5"
      >
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
          {auction.product?.images?.[0] && (
            <img
              src={auction.product.images[0]}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Flame className="h-3 w-3 text-fuchsia-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-400">
              Subasta en vivo
            </span>
          </div>
          <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
            {auction.product?.title ?? 'Subasta en vivo'}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[10px] text-zinc-400">Puja</span>
            <span className="text-sm font-black text-amber-400 tabular-nums">
              {formatPEN(auction.currentPrice)}
            </span>
          </div>
        </div>
      </Link>
      <div className="relative mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold text-rose-300 tabular-nums">
            {mm}:{ss}
          </span>
        </div>
        <Link
          href={ROUTES.auction(auction.id)}
          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[10px] font-black flex items-center gap-1"
        >
          Pujar <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {index === 0 && (
        <span className="absolute top-2 right-2 text-[9px] font-black tracking-wider uppercase text-amber-300/80">
          🔥 Top
        </span>
      )}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════ */
/* PAGE                                                               */
/* ════════════════════════════════════════════════════════════════ */
export default function MarketplacePage() {
  const [filter, setFilter] = React.useState<FilterId>('all')
  const [query, setQuery] = React.useState('')

  // Sellers that are currently live — used by 'live' filter & 'Live' badge
  const liveSellerIds = React.useMemo(
    () => new Set(MOCK_STREAMS.filter((s) => s.isLive).map((s) => s.sellerId)),
    [],
  )

  // Index map for offer detection (index % 4 === 3)
  const offerIndexSet = React.useMemo(
    () => new Set(MOCK_PRODUCTS.map((_, i) => i).filter((i) => i % 4 === 3)),
    [],
  )

  const liveCount = MOCK_STREAMS.filter((s) => s.isLive).length
  const topSeller =
    MOCK_PROFILES.filter((p) => p.isLiveSeller).sort((a, b) => b.salesCount - a.salesCount)[0] ??
    MOCK_PROFILES[0]

  // Compute filtered + searched products
  const filtered = React.useMemo(() => {
    let list: Product[] = MOCK_PRODUCTS.slice()

    // Apply filter
    switch (filter) {
      case 'live':
        list = list.filter((p) => liveSellerIds.has(p.sellerId))
        break
      case 'new':
        list = list.slice(0, 6)
        break
      case 'offer':
        list = list.filter((_, i) => offerIndexSet.has(i))
        break
      case 'top':
        list = list.slice().sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'all':
      default:
        break
    }

    // Apply search query (intersection)
    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.seller?.displayName ?? '').toLowerCase().includes(q),
      )
    }

    return list
  }, [filter, query, liveSellerIds, offerIndexSet])

  // For each filtered product, find its original index (for offer / new logic)
  const productsWithMeta = React.useMemo(
    () =>
      filtered.map((p) => {
        const originalIndex = MOCK_PRODUCTS.findIndex((mp) => mp.id === p.id)
        return {
          product: p,
          index: originalIndex >= 0 ? originalIndex : 0,
          isOfferItem: originalIndex >= 0 && offerIndexSet.has(originalIndex),
          isLiveItem: liveSellerIds.has(p.sellerId),
        }
      }),
    [filtered, offerIndexSet, liveSellerIds],
  )

  const hasQuery = query.trim().length > 0
  const showClearButton = hasQuery

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 dark">
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-12">
        {/* ============================================================= */}
        {/* HERO KPI BANNER                                                */}
        {/* ============================================================= */}
        <HeroKpiBanner
          liveCount={liveCount}
          productCount={MOCK_PRODUCTS.length}
          topSeller={topSeller}
        />

        {/* ============================================================= */}
        {/* SEARCH + FILTER CHIPS                                         */}
        {/* ============================================================= */}
        <section className="mt-5 md:mt-6" aria-label="Filtros y búsqueda">
          {/* Sticky search on mobile */}
          <div className="md:hidden sticky top-0 z-20 -mx-4 px-4 pt-3 pb-2 bg-zinc-950/95 backdrop-blur-xl">
            <SearchInput
              query={query}
              setQuery={setQuery}
              showClearButton={showClearButton}
            />
          </div>
          {/* Static search on desktop */}
          <div className="hidden md:block mb-3">
            <SearchInput
              query={query}
              setQuery={setQuery}
              showClearButton={showClearButton}
            />
          </div>

          {/* Filter chips (horizontal scroll on mobile) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:flex-wrap md:overflow-visible">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.id}
                active={filter === f.id}
                label={f.label}
                icon={f.icon}
                accent={f.accent}
                onClick={() => setFilter(f.id)}
              />
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* RESULTS COUNT                                                 */}
        {/* ============================================================= */}
        <div className="mt-4 mb-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            <span className="font-bold text-white">{productsWithMeta.length}</span>{' '}
            resultado{productsWithMeta.length !== 1 ? 's' : ''}
            {filter !== 'all' && (
              <span className="text-zinc-600"> · filtro: {FILTERS.find((f) => f.id === filter)?.label}</span>
            )}
            {hasQuery && <span className="text-zinc-600"> · “{query.trim()}”</span>}
          </p>
          {productsWithMeta.length > 0 && (
            <p className="hidden md:block text-[10px] text-zinc-600 uppercase tracking-wider font-bold">
              {filter === 'top' ? 'Precio ↓' : 'Relevancia'}
            </p>
          )}
        </div>

        {/* ============================================================= */}
        {/* PRODUCT GRID (BENTO)                                          */}
        {/* ============================================================= */}
        {productsWithMeta.length === 0 ? (
          <EmptyState query={query} onClear={() => { setQuery(''); setFilter('all') }} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
          >
            {productsWithMeta.map(({ product, index, isOfferItem, isLiveItem }) => (
              <ProductBentoCard
                key={product.id}
                product={product}
                index={index}
                isOfferItem={isOfferItem}
                isLiveItem={isLiveItem}
              />
            ))}
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* LIVE AUCTIONS RAIL (visible when filter != 'live')             */}
        {/* ============================================================= */}
        {filter !== 'live' && MOCK_TRENDING_AUCTIONS.length > 0 && (
          <section className="mt-10 md:mt-12" aria-label="Subastas en vivo destacadas">
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-500/15 border border-rose-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                </span>
                <h2 className="text-lg md:text-xl font-black text-white font-display">
                  Subastas en vivo
                </h2>
                <span className="text-xs text-zinc-500">
                  {MOCK_TRENDING_AUCTIONS.length} activas
                </span>
              </div>
              <Link
                href={ROUTES.live}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                Ver todo <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
            >
              {MOCK_TRENDING_AUCTIONS.map((a, i) => (
                <AuctionMiniCard key={a.id} auction={a} index={i} />
              ))}
            </motion.div>
          </section>
        )}

        {/* ============================================================= */}
        {/* TRUST STRIPE                                                  */}
        {/* ============================================================= */}
        <section className="mt-10 md:mt-12 rounded-2xl border border-white/5 bg-zinc-900/40 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-black text-white font-display">
                Compra con confianza
              </h3>
            </div>
            <p className="text-xs text-zinc-400 flex-1 leading-relaxed">
              Todos los pagos están protegidos con escrow automático. El dinero
              solo se libera al vendedor cuando confirmas la recepción del
              producto. En caso de disputa, nuestro equipo de soporte peruano
              media en menos de 24 horas. Paga con Yape, Plin o PagoEfectivo.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Yape', 'Plin', 'PagoEfectivo', 'Tarjeta'].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Search input — translúcido glassmorphism                          */
/* ────────────────────────────────────────────────────────────────── */
function SearchInput({
  query, setQuery, showClearButton,
}: {
  query: string
  setQuery: (v: string) => void
  showClearButton: boolean
}) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos, marcas, vendedores…"
        aria-label="Buscar en el marketplace"
        className="w-full h-11 pl-11 pr-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all"
      />
      <AnimatePresence>
        {showClearButton && (
          <motion.button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => setQuery('')}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
          >
            <X className="h-3 w-3 text-zinc-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Empty state                                                        */
/* ────────────────────────────────────────────────────────────────── */
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-zinc-900/40 p-10 text-center"
    >
      <div className="mx-auto h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
        <Search className="h-5 w-5 text-zinc-500" />
      </div>
      <p className="text-sm font-bold text-white">Sin resultados</p>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
        No encontramos productos para “{query.trim()}”. Prueba con otro término
        o reinicia los filtros para ver todo el marketplace.
      </p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-zinc-950 text-xs font-bold hover:bg-amber-300 transition-colors"
      >
        <X className="h-3.5 w-3.5" /> Limpiar filtros
      </button>
    </motion.div>
  )
}
