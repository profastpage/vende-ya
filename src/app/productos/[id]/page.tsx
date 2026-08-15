'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart, Share2, ShoppingBag, Truck, Shield, Minus, Plus, ChevronRight,
  Verified, Star, MapPin, Sparkles, Tag,
} from 'lucide-react'
import CheckoutBottomSheet from '@/components/vendeda/CheckoutBottomSheet'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PRODUCTS, MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { formatPEN, initials, timeAgoEs } from '@/lib/vendeda/format'
import { PAYMENT_METHODS, SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import {
  GlassCard, GradientButton, GhostButton, StatusBadge,
  staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'

type Review = {
  id: string
  name: string
  avatar?: string
  rating: number
  date: string
  text: string
  verified: boolean
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'María L.',
    rating: 5,
    date: 'hace 3 días',
    text: 'Excelente producto, llegó a Lima en 2 días por Olva. Calidad superior a la foto, muy contenta.',
    verified: true,
  },
  {
    id: 'r2',
    name: 'Carlos M.',
    rating: 4,
    date: 'hace 1 semana',
    text: 'Buen producto, demoró un poco más de lo esperado pero el vendedor respondió enseguida. Recomendado.',
    verified: true,
  },
  {
    id: 'r3',
    name: 'Ana R.',
    rating: 5,
    date: 'hace 2 semanas',
    text: 'Compré 2 unidades y me dieron descuento por mayoreo. Pago con Yape en segundos. ¡Vende Ya Rox!',
    verified: false,
  },
]

type TabId = 'description' | 'reviews' | 'shipping'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { toast } = useToast()
  const [qty, setQty] = React.useState(1)
  const [favorited, setFavorited] = React.useState(false)
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [activeImage, setActiveImage] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState<TabId>('description')

  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const seller = product.seller
  const related = MOCK_PRODUCTS
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 6)

  // Stock pressure bar — capped at 25 units as "full" baseline.
  const stockPct = Math.min(100, Math.max(4, (product.stock / 25) * 100))
  const lowStock = product.stock <= 5

  const handleBuy = () => setCheckoutOpen(true)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: '🔗 Enlace copiado' })
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  const avgRating = 4.8

  const breadcrumbs = [
    { label: 'Marketplace', href: ROUTES.marketplace },
    { label: product.title },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs md:text-sm text-zinc-500 mb-6 overflow-hidden">
          <Link href={ROUTES.home} className="hover:text-amber-400 transition-colors shrink-0">
            Inicio
          </Link>
          {breadcrumbs.map((bc, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="h-3 w-3 mx-1 shrink-0" />
              {bc.href ? (
                <Link href={bc.href} className="hover:text-amber-400 transition-colors truncate">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-white font-medium truncate">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Hero */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-6 md:gap-8"
        >
          {/* Images */}
          <motion.div variants={staggerItem} className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
              {product.images[activeImage] && (
                <img
                  src={product.images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <StatusBadge variant="lime">{product.condition === 'nuevo' ? 'Nuevo' : product.condition}</StatusBadge>
                {product.shipsNationwide && <StatusBadge variant="sky">Envío nacional</StatusBadge>}
              </div>
              <button
                onClick={() => setFavorited((v) => !v)}
                aria-label="Favorito"
                className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    favorited ? 'text-rose-400 fill-rose-400' : 'text-white'
                  }`}
                />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.div variants={staggerItem} className="space-y-5">
            {/* Title + price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-display text-white leading-tight">
                {product.title}
              </h1>
              {product.category && (
                <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {product.category.nameEs}
                </p>
              )}
              <div className="flex items-end gap-3 mt-3">
                <p className="text-4xl md:text-5xl font-black text-amber-400 tabular-nums leading-none">
                  {formatPEN(product.basePrice, product.currency)}
                </p>
                <div className="flex items-center gap-1 text-xs text-zinc-400 mb-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{avgRating.toFixed(1)}</span>
                  <span>· {MOCK_REVIEWS.length} reseñas</span>
                </div>
              </div>
              {product.shippingCost === 0 ? (
                <p className="text-sm text-lime-400 font-bold mt-2">🚚 Envío gratis a todo Perú</p>
              ) : (
                <p className="text-sm text-zinc-400 mt-2">
                  Envío desde <span className="font-bold text-white">{formatPEN(product.shippingCost)}</span>
                  <span className="text-zinc-500"> · Olva / Shalom / Marvisur</span>
                </p>
              )}
            </div>

            {/* Stock pressure bar */}
            <div className="rounded-xl bg-zinc-900/80 border border-white/5 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Stock disponible</span>
                <span className={`font-black tabular-nums ${lowStock ? 'text-rose-400' : 'text-white'}`}>
                  {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    lowStock
                      ? 'bg-gradient-to-r from-rose-500 to-amber-400'
                      : 'bg-gradient-to-r from-amber-400 to-fuchsia-500'
                  }`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
              {lowStock && (
                <p className="text-[11px] text-rose-400 font-bold mt-2 flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                  </span>
                  ¡Solo quedan {product.stock}! Cómpralo ya
                </p>
              )}
            </div>

            {/* Seller chip */}
            {seller && (
              <Link href={ROUTES.seller(seller.username)} className="block">
                <GlassCard className="p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 p-0.5 shrink-0">
                      <div className="h-full w-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                        {seller.avatarUrl ? (
                          <img
                            src={seller.avatarUrl}
                            alt={seller.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {initials(seller.displayName)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-white truncate">{seller.displayName}</span>
                        {seller.isVerified && <Verified className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {seller.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>{seller.salesCount} ventas</span>
                        {seller.department && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" /> {seller.department}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 hover:text-amber-300 shrink-0">
                      Ver tienda →
                    </span>
                  </div>
                </GlassCard>
              </Link>
            )}

            {/* Quantity + Buy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-300">Cantidad</span>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Disminuir"
                    className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-black text-white tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock}
                    aria-label="Aumentar"
                    className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GradientButton onClick={handleBuy} className="h-14 text-base">
                  <ShoppingBag className="h-5 w-5" /> Comprar ahora
                </GradientButton>
                <GhostButton className="h-14">
                  <Tag className="h-4 w-4" /> Hacer oferta
                </GhostButton>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFavorited((v) => !v)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <Heart className={`h-3.5 w-3.5 ${favorited ? 'text-rose-400 fill-rose-400' : ''}`} />
                  {favorited ? 'Guardado' : 'Favorito'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" /> Compartir
                </button>
              </div>
            </div>

            {/* Payment chips */}
            <div className="rounded-xl bg-zinc-900/80 border border-white/5 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-lime-400" /> Métodos de pago aceptados
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.paymentMethods.map((pmId) => {
                  const pm = PAYMENT_METHODS[pmId as keyof typeof PAYMENT_METHODS]
                  if (!pm) return null
                  return (
                    <div
                      key={pmId}
                      className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5"
                    >
                      <div
                        className="h-5 w-5 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                        style={{ backgroundColor: pm.color }}
                      >
                        {pm.label.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-white">{pm.label}</span>
                      {(pmId === 'yape' || pmId === 'plin') && (
                        <span className="text-[9px] font-bold text-lime-400 bg-lime-400/15 px-1.5 py-0.5 rounded">
                          Instantáneo
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-10 md:mt-14">
          <div className="flex items-center gap-1 border-b border-white/10 mb-6 overflow-x-auto">
            {[
              { id: 'description' as TabId, label: 'Descripción' },
              { id: 'reviews' as TabId, label: `Reseñas (${MOCK_REVIEWS.length})` },
              { id: 'shipping' as TabId, label: 'Envío' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 md:px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="product-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-amber-400 to-fuchsia-500"
                  />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6 md:p-8"
            >
              <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Sobre este producto
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Condición</p>
                  <p className="text-sm font-bold text-white mt-0.5 capitalize">{product.condition}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Envía desde</p>
                  <p className="text-sm font-bold text-white mt-0.5">{product.shippingFrom ?? 'Lima'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Cobertura</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {product.shipsNationwide ? 'Todo Perú' : 'Solo local'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Publicado</p>
                  <p className="text-sm font-bold text-white mt-0.5">{timeAgoEs(product.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-fuchsia-500/10 border border-white/5 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-400 tabular-nums leading-none">
                    {avgRating.toFixed(1)}
                  </p>
                  <div className="flex items-center justify-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${
                          n <= Math.round(avgRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{MOCK_REVIEWS.length} reseñas</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars, i) => {
                    const pct = stars === 5 ? 67 : stars === 4 ? 22 : stars === 3 ? 11 : 0
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400 w-3">{stars}</span>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-zinc-500 w-8 text-right tabular-nums">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {MOCK_REVIEWS.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 p-0.5 shrink-0">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{initials(r.name)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{r.name}</span>
                        {r.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-300 bg-sky-400/15 border border-sky-400/30 px-1.5 py-0.5 rounded">
                            <Verified className="h-2.5 w-2.5" /> Verificado
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 ml-auto">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={`h-3 w-3 ${
                                n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{r.date}</p>
                      <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6 md:p-8"
            >
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-400" /> Opciones de envío
              </h3>
              <div className="space-y-3">
                {SHIPPING_CARRIERS.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.label.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{c.label}</p>
                      <p className="text-xs text-zinc-500">{c.estDays}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400 tabular-nums">
                      {product.shippingCost === 0 && c.id !== 'pickup'
                        ? 'Gratis'
                        : c.id === 'pickup'
                          ? '—'
                          : formatPEN(product.shippingCost)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Origen</p>
                  <p className="text-sm font-bold text-white mt-0.5">{product.shippingFrom ?? 'Lima'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Cobertura</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {product.shipsNationwide ? 'Todo el Perú' : 'Solo local'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Protección</p>
                  <p className="text-sm font-bold text-lime-400 mt-0.5 flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> Escrow Vende Ya
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Related products rail */}
        {related.length > 0 && (
          <div className="mt-12 md:mt-16">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-black text-white">Productos relacionados</h2>
              <Link
                href={ROUTES.marketplace}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={ROUTES.product(p.id)}
                  className="group rounded-2xl bg-zinc-900/80 border border-white/5 overflow-hidden hover:border-amber-400/30 transition-colors"
                >
                  <div className="aspect-square bg-zinc-800 overflow-hidden">
                    {p.images[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-white line-clamp-2 leading-tight">{p.title}</p>
                    <p className="text-sm font-black text-amber-400 mt-1.5 tabular-nums">
                      {formatPEN(p.basePrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Bottom Sheet */}
        <CheckoutBottomSheet
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          productId={product.id}
          productName={product.title}
          price={product.basePrice * qty}
          source="marketplace"
          sellerId={seller?.id ?? 'demo-seller'}
          buyerId={MOCK_PROFILES[5]?.id ?? 'demo-buyer'}
          shipment={{
            originAgencyId: 'LIM-01',
            destinationAgencyId: 'LIM-02',
            senderDni: '12345678',
            senderName: seller?.displayName ?? 'Vendedor',
            senderPhone: '999888777',
            receiverDni: '87654321',
            receiverName: MOCK_PROFILES[5]?.displayName ?? 'Comprador',
            receiverPhone: '999111222',
            packageDescription: `${qty}x ${product.title}`,
            weightKg: 0.5 * qty,
            declaredValue: product.basePrice * qty,
          }}
        />
      </div>
    </div>
  )
}
