'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, X, Flame, Crown, Sparkles, TrendingUp,
  ShoppingCart, Star, Eye, Radio,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryRail } from '@/components/vendeda/CategorySidebar'
import { MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS, MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { ROUTES } from '@/lib/vendeda/routes'
import { formatPEN } from '@/lib/vendeda/format'
import type { Product, Auction } from '@/lib/vendeda/types'

const breadcrumbs: Breadcrumb[] = [{ label: 'Marketplace' }]

const QUICK_FILTERS = [
  { id: 'all', label: 'Todo', icon: Sparkles },
  { id: 'live', label: 'En vivo', icon: Radio },
  { id: 'new', label: 'Nuevos', icon: TrendingUp },
  { id: 'hot', label: '🔥 Ofertas', icon: Flame },
  { id: 'top', label: '⭐ Top', icon: Crown },
] as const

export default function MarketplacePage() {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [view, setView] = React.useState<'products' | 'auctions'>('products')
  const [showFilters, setShowFilters] = React.useState(false)
  const [maxPrice, setMaxPrice] = React.useState('')
  const [quickFilter, setQuickFilter] = React.useState<string>('all')

  const filtered = React.useMemo(() => {
    let list: Array<{ type: 'product' | 'auction'; data: Product | Auction }> = []
    if (view === 'products') {
      let products = MOCK_PRODUCTS
      if (query) {
        products = products.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        )
      }
      if (category !== 'all') {
        products = products.filter((p) => p.category?.slug === category)
      }
      if (maxPrice) {
        products = products.filter((p) => p.basePrice <= parseFloat(maxPrice))
      }
      list = products.map((p) => ({ type: 'product' as const, data: p }))
    } else {
      let auctions = MOCK_TRENDING_AUCTIONS
      if (query) {
        auctions = auctions.filter((a) => a.product?.title.toLowerCase().includes(query.toLowerCase()))
      }
      if (maxPrice) {
        auctions = auctions.filter((a) => a.currentPrice <= parseFloat(maxPrice))
      }
      list = auctions.map((a) => ({ type: 'auction' as const, data: a }))
    }
    return list
  }, [view, query, category, maxPrice, quickFilter])

  const goToProduct = (id: string) => router.push(ROUTES.product(id))
  const goToAuction = (id: string) => router.push(ROUTES.auction(id))

  return (
    <AppShell title="Marketplace" breadcrumbs={breadcrumbs} maxWidth="max-w-6xl">
      {/* Hero stat banner */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">En vivo ahora</span>
          </div>
          <div className="text-xl font-black font-mono text-white">12</div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">▲ 3 vs ayer</p>
        </div>
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Vendidos hoy</span>
          </div>
          <div className="text-xl font-black font-mono text-amber-400">847</div>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">▲ +18% semana</p>
        </div>
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top vendedor</span>
          </div>
          <div className="text-sm font-black text-white truncate">Rosa Q.</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">⭐ 4.9 (1.2K)</p>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, marcas, vendedores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters((v) => !v)}
          className="h-11 bg-slate-950 border-slate-800 hover:bg-slate-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick filters (chips) */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {QUICK_FILTERS.map((f) => {
          const isActive = quickFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setQuickFilter(f.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 mb-4 space-y-3 bg-slate-950 border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">Filtros avanzados</h3>
                <button
                  onClick={() => { setCategory('all'); setMaxPrice(''); setQuery('') }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Limpiar
                </button>
              </div>
              <CategoryRail active={category} onSelect={setCategory} />
              <div>
                <label className="text-xs text-slate-400">Precio máximo: <b className="text-amber-400">S/. {maxPrice || '∞'}</b></label>
                <input
                  type="range" min="0" max="2000" step="50"
                  value={maxPrice || '0'}
                  onChange={(e) => setMaxPrice(e.target.value === '0' ? '' : e.target.value)}
                  className="w-full accent-amber-500 mt-1"
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('products')}
          className={`px-4 h-10 rounded-xl text-sm font-bold transition-colors ${
            view === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-950 text-slate-400 border border-slate-800'
          }`}
        >
          🛍️ Productos ({MOCK_PRODUCTS.length})
        </button>
        <button
          onClick={() => setView('auctions')}
          className={`px-4 h-10 rounded-xl text-sm font-bold transition-colors ${
            view === 'auctions'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-950 text-slate-400 border border-slate-800'
          }`}
        >
          ⚡ Subastas ({MOCK_TRENDING_AUCTIONS.length})
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 mb-4">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · ordenados por relevancia
      </p>

      {/* Bento Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 bg-slate-950 border-slate-800">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No encontramos resultados. Prueba con otros filtros.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filtered.map((item, idx) => {
            if (item.type === 'auction') {
              const a = item.data as Auction
              return (
                <AuctionBentoCard
                  key={a.id}
                  auction={a}
                  onClick={() => goToAuction(a.id)}
                />
              )
            }
            const p = item.data as Product
            return (
              <ProductBentoCard
                key={p.id}
                product={p}
                index={idx}
                onClick={() => goToProduct(p.id)}
              />
            )
          })}
        </div>
      )}
    </AppShell>
  )
}

// ─────────────────────────────────────────────────────────────────────
// PRODUCTO — bento card con stock crítico
// ─────────────────────────────────────────────────────────────────────
function ProductBentoCard({
  product, index, onClick,
}: {
  product: Product
  index: number
  onClick: () => void
}) {
  const stock = Math.max(1, Math.floor((index * 7 + 13) % 30))
  const seller = MOCK_PROFILES[index % MOCK_PROFILES.length]
  const isLowStock = stock <= 5
  const isNew = index < 2
  const isHot = index === 1

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-slate-950 border border-slate-800 rounded-3xl p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden group text-left"
    >
      {/* Top tags */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {isNew && (
          <span className="bg-slate-900/80 backdrop-blur-md text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full border border-white/10 uppercase text-emerald-400">
            Nuevo
          </span>
        )}
        {isHot && (
          <span className="bg-rose-600 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
            <Flame className="h-2.5 w-2.5" /> Oferta
          </span>
        )}
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-slate-900 rounded-2xl mb-3 overflow-hidden border border-slate-800 relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs font-bold">
            [ Imagen ]
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <div className="flex items-center gap-1.5 text-[10px] text-white">
            <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[8px]">
              {seller.displayName.slice(0, 1)}
            </div>
            <span className="font-semibold truncate">{seller.displayName}</span>
            {seller.isVerified && <Crown className="h-2.5 w-2.5 text-sky-400" />}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug mb-2 min-h-[2.4em]">
            {product.title}
          </h3>

          {/* Stock progress bar */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stock / 30) * 100}%` }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className={`h-full rounded-full ${isLowStock ? 'bg-rose-500' : 'bg-amber-400'}`}
              />
            </div>
            <span className={`text-[9px] font-bold ${isLowStock ? 'text-rose-400' : 'text-slate-500'}`}>
              {stock}u
            </span>
          </div>
          {isLowStock && (
            <p className="text-[9px] font-bold text-rose-400 mb-1 animate-pulse">
              ¡Solo {stock} disponibles!
            </p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-900">
          <div className="flex flex-col">
            <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase leading-none">
              Precio
            </span>
            <span className="text-base font-black text-amber-400 font-mono mt-0.5">
              {formatPEN(product.basePrice)}
            </span>
          </div>
          <div className="bg-amber-500 hover:bg-amber-400 text-slate-950 w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-amber-500/10">
            +
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────
// SUBASTA — bento card con cronómetro + puja actual
// ─────────────────────────────────────────────────────────────────────
function AuctionBentoCard({
  auction, onClick,
}: {
  auction: Auction
  onClick: () => void
}) {
  const seller = auction.seller ?? MOCK_PROFILES[0]
  const product = auction.product
  const isLive = Boolean(auction.streamId)
  // Calcular segundos restantes a partir de endsAt (string ISO)
  const endsAtMs = auction.endsAt ? new Date(auction.endsAt).getTime() : Date.now() + 600000
  const secondsLeft = Math.max(60, Math.floor((endsAtMs - Date.now()) / 1000))
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 border border-purple-500/30 rounded-3xl p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden group text-left"
    >
      {/* Tags */}
      <div className="absolute top-2 left-2 z-10 flex gap-1">
        {isLive && (
          <span className="bg-rose-600 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 uppercase animate-pulse">
            <span className="w-1 h-1 rounded-full bg-white" /> LIVE
          </span>
        )}
        <span className="bg-purple-500/20 backdrop-blur-md text-purple-300 border border-purple-500/30 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
          Subasta
        </span>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-slate-900 rounded-2xl mb-3 overflow-hidden border border-purple-500/20 relative">
        {product?.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs font-bold">
            [ Subasta ]
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
          <div className="flex items-center gap-1 text-[10px] text-white font-semibold">
            <Eye className="h-2.5 w-2.5" /> {auction.watcherCount ?? Math.floor(Math.random() * 100)}
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-purple-500/30 text-[10px] font-mono text-amber-400">
            ⏱ {mm}m
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug mb-1.5 min-h-[2.4em]">
          {product?.title ?? 'Subasta en vivo'}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-slate-400">de {seller.displayName}</span>
        </div>

        {/* Bid row */}
        <div className="flex justify-between items-center pt-2 border-t border-purple-900/40">
          <div className="flex flex-col">
            <span className="text-[9px] font-black tracking-wider text-purple-400 uppercase leading-none">
              Puja actual
            </span>
            <span className="text-base font-black text-amber-400 font-mono mt-0.5">
              {formatPEN(auction.currentPrice)}
            </span>
          </div>
          <div className="bg-purple-500 hover:bg-purple-400 text-white w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-purple-500/20">
            →
          </div>
        </div>
      </div>
    </motion.button>
  )
}
