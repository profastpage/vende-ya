'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, Heart, BadgeCheck, Clock, Gavel, Sparkles, PackageOpen } from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS, MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { formatPEN, initials } from '@/lib/vendeda/format'
import { CATEGORIES } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import type { Product, Auction, Profile } from '@/lib/vendeda/types'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Buscar' }]

type Tab = 'all' | 'products' | 'auctions' | 'sellers'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'products', label: 'Productos' },
  { id: 'auctions', label: 'Subastas' },
  { id: 'sellers', label: 'Vendedores' },
]

function ProductBento({ product }: { product: Product }) {
  const stockPercent = Math.min(100, Math.max(0, ((product.stock ?? 0) / 50) * 100))
  const stockColor = stockPercent < 25 ? 'bg-rose-500' : stockPercent < 60 ? 'bg-amber-400' : 'bg-lime-400'
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm"
    >
      <Link href={ROUTES.product(product.id)} className="block relative aspect-square overflow-hidden bg-zinc-950">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-white text-[9px] font-bold tracking-wider uppercase">
            {product.condition === 'nuevo' ? 'Nuevo' : product.condition.split('-')[0]}
          </span>
        </div>
        <button className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center group/like">
          <Heart className="h-3.5 w-3.5 text-zinc-300 group-hover/like:text-rose-400 transition-colors" />
        </button>
      </Link>
      <div className="p-3">
        <p className="text-xs font-semibold text-white line-clamp-2 leading-tight min-h-[2rem]">
          {product.title}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-black text-amber-400 tabular-nums">
            {formatPEN(product.basePrice ?? 0)}
          </span>
          <span className="text-[10px] text-zinc-500">Stock: {product.stock ?? 0}</span>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full ${stockColor} transition-all duration-500`}
            style={{ width: `${stockPercent}%` }}
          />
        </div>
        {product.seller && (
          <Link
            href={ROUTES.seller(product.seller.username)}
            className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-[7px] font-black text-white">
              {initials(product.seller.displayName)}
            </div>
            <span className="truncate">{product.seller.displayName}</span>
            {product.seller.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />}
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function AuctionBento({ auction }: { auction: Auction }) {
  const endsAtMs = auction.endsAt ? new Date(auction.endsAt).getTime() : null
  const secondsLeft = endsAtMs ? Math.max(0, Math.floor((endsAtMs - Date.now()) / 1000)) : 0
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const product = auction.product
  const seller = auction.seller
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm"
    >
      <Link href={ROUTES.auction(auction.id)} className="block relative aspect-square overflow-hidden bg-zinc-950">
        {product?.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
        {auction.status === 'live' && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-md border border-rose-300/30">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-wider">EN VIVO</span>
          </div>
        )}
        {endsAtMs && (
          <div className="absolute top-2 right-2 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums bg-black/60 backdrop-blur-md border border-white/10 text-amber-400">
            <Clock className="inline h-2.5 w-2.5 mr-0.5" />
            {mm}:{ss}
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-2.5 pt-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-zinc-300 leading-none">
                {auction.status === 'live' ? 'Puja actual' : 'Precio'}
              </div>
              <div className="text-base font-black text-amber-400 tabular-nums leading-tight">
                {formatPEN(auction.currentPrice)}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white">
              <Gavel className="h-2.5 w-2.5" />
              {auction.bidCount}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3">
        <p className="text-xs font-semibold text-white line-clamp-2 leading-tight min-h-[2rem]">
          {product?.title ?? 'Producto'}
        </p>
        {seller && (
          <Link
            href={ROUTES.seller(seller.username)}
            className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-[7px] font-black text-white">
              {initials(seller.displayName)}
            </div>
            <span className="truncate">{seller.displayName}</span>
            {seller.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />}
          </Link>
        )}
      </div>
    </motion.div>
  )
}

function SellerBento({ profile }: { profile: Profile }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group">
      <Link
        href={ROUTES.seller(profile.username)}
        className="block rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-4 text-center"
      >
        <div className="relative inline-block">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-white font-black text-lg">
            {initials(profile.displayName)}
          </div>
          {profile.isLiveSeller && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-bold text-white flex items-center justify-center gap-1">
          <span className="truncate max-w-[140px]">{profile.displayName}</span>
          {profile.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5">
          ⭐ {profile.rating.toFixed(1)} · {profile.followerCount.toLocaleString('es-PE')} seguidores
        </p>
        <p className="text-[10px] text-amber-400 mt-1.5 font-semibold">
          {profile.salesCount.toLocaleString('es-PE')} ventas
        </p>
      </Link>
    </motion.div>
  )
}

function SearchInner() {
  const params = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = React.useState(initialQ)
  const [tab, setTab] = React.useState<Tab>('all')
  const [cat, setCat] = React.useState<string>('all')

  const q = query.toLowerCase().trim()

  const products = q
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    : MOCK_PRODUCTS.slice(0, 6)

  const auctions = q
    ? MOCK_TRENDING_AUCTIONS.filter((a) => a.product?.title.toLowerCase().includes(q))
    : MOCK_TRENDING_AUCTIONS.slice(0, 4)

  const sellers = q
    ? MOCK_PROFILES.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          (p.bio ?? '').toLowerCase().includes(q)
      )
    : []

  const filteredProducts = cat === 'all' ? products : products.filter((p) => p.categoryId === cat)

  const totalResults =
    (tab === 'all' || tab === 'products' ? filteredProducts.length : 0) +
    (tab === 'all' || tab === 'auctions' ? auctions.length : 0) +
    (tab === 'all' || tab === 'sellers' ? sellers.length : 0)

  return (
    <>
      {/* Big search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400 pointer-events-none" />
        <input
          autoFocus
          placeholder="Buscar productos, subastas, vendedores..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white text-base placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            aria-label="Limpiar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 h-9 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 border-amber-400/50 shadow-lg shadow-fuchsia-500/20'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setCat('all')}
          className={`px-3 h-8 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
            cat === 'all'
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-transparent text-zinc-500 border-white/5 hover:text-zinc-300'
          }`}
        >
          Todas las categorías
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`px-3 h-8 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
              cat === c.id
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-zinc-500 border-white/5 hover:text-zinc-300'
            }`}
          >
            {c.nameEs}
          </button>
        ))}
      </div>

      {/* Results count */}
      {q && (
        <p className="text-xs text-zinc-500 mb-4">
          {totalResults > 0 ? (
            <>
              <span className="text-white font-bold">{totalResults}</span> resultado(s) para{' '}
              <span className="text-amber-400 font-bold">"{query}"</span>
            </>
          ) : (
            <>Sin resultados para <span className="text-amber-400">"{query}"</span></>
          )}
        </p>
      )}

      {/* Empty state */}
      {!q && (
        <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-12 text-center">
          <Search className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-zinc-300 font-semibold">Escribe para buscar en Vende Ya</p>
          <p className="text-zinc-500 text-xs mt-1 max-w-md mx-auto">
            Encuentra productos, subastas en vivo y vendedores verificados. Usa términos como
            "polo", "Yape", "Arequipa" o nombres de marcas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['polo', 'Samsung', 'artesanía', 'skincare', 'Nike'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 h-8 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-amber-400 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {q && totalResults === 0 && (
        <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-12 text-center">
          <PackageOpen className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-zinc-300 font-semibold">Sin resultados</p>
          <p className="text-zinc-500 text-xs mt-1">
            Prueba con otros términos o explora las categorías sugeridas arriba.
          </p>
        </div>
      )}

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Auctions */}
        {(tab === 'all' || tab === 'auctions') && auctions.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="font-black text-white text-base">
                Subastas <span className="text-zinc-500 font-normal">({auctions.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {auctions.map((a) => (
                <motion.div key={a.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <AuctionBento auction={a} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        {(tab === 'all' || tab === 'products') && filteredProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PackageOpen className="h-4 w-4 text-fuchsia-400" />
              <h2 className="font-black text-white text-base">
                Productos <span className="text-zinc-500 font-normal">({filteredProducts.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((p) => (
                <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <ProductBento product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Sellers */}
        {(tab === 'all' || tab === 'sellers') && sellers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="h-4 w-4 text-sky-400" />
              <h2 className="font-black text-white text-base">
                Vendedores <span className="text-zinc-500 font-normal">({sellers.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sellers.map((s) => (
                <motion.div key={s.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <SellerBento profile={s} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </>
  )
}

export default function SearchPage() {
  return (
    <StaticPageShell
      title="Buscar"
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-6xl"
    >
      <React.Suspense
        fallback={
          <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-12 text-center text-zinc-500">
            Cargando búsqueda...
          </div>
        }
      >
        <SearchInner />
      </React.Suspense>
    </StaticPageShell>
  )
}
