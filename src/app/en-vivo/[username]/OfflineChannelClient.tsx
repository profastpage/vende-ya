'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Radio, ShoppingCart, Share2, BadgeCheck, Star,
  MapPin, Sparkles, Package, ArrowRight, Eye, Play,
  Check, UserCheck, UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPEN, formatViewers } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import { safeMainImage, DEFAULT_PRODUCT_IMAGE, safeStreamCover } from '@/lib/vendeda/images'

interface OfflineChannelProps {
  seller: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
    bio?: string | null
    department?: string | null
    rating: number
    ratingsCount: number
    salesCount: number
    followerCount: number
    isVerified: boolean
  }
  streamTitle?: string | null
  products: any[]
  otherLiveStreams: any[]
}

export default function OfflineChannelClient({
  seller,
  streamTitle,
  products,
  otherLiveStreams
}: OfflineChannelProps) {
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Follow persistence
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`vy_follow_${seller.id}`)
      if (stored === 'true') setIsFollowing(true)
    } catch {}
  }, [seller.id])

  const handleFollow = () => {
    const nextState = !isFollowing
    setIsFollowing(nextState)
    try {
      localStorage.setItem(`vy_follow_${seller.id}`, nextState ? 'true' : 'false')
    } catch {}
    if (nextState) {
      toast.success(`¡Siguiendo a ${seller.displayName}!`, {
        description: 'Te avisaremos cuando inicie una nueva transmisión en vivo.'
      })
    } else {
      toast.info(`Dejaste de seguir a ${seller.displayName}`)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Enlace del canal copiado al portapapeles')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const raw = localStorage.getItem('vy_cart') || '[]'
      const cart = JSON.parse(raw)
      const existing = cart.find((i: any) => i.productId === product.id)
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1
      } else {
        cart.push({
          productId: product.id,
          title: product.title,
          price: Number(product.basePrice ?? product.price ?? 0),
          image: safeMainImage(product.images),
          quantity: 1,
          seller: {
            id: seller.id,
            displayName: seller.displayName,
            username: seller.username
          }
        })
      }
      localStorage.setItem('vy_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('vy_cart_updated'))
      toast.success('¡Agregado al carrito!', {
        description: product.title
      })
    } catch (err) {
      console.error('Error adding to cart', err)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ────────────────────────────────────────────────────────
          CANAL FUERA DE LÍNEA — Notice Banner
          ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-border/40 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 opacity-75" />
            </span>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-zinc-200">Canal fuera de línea</span>
              <span className="text-zinc-400 mx-2">·</span>
              <span className="text-zinc-300">
                {seller.displayName} no está transmitiendo en vivo en este momento.
              </span>
            </div>
          </div>
          <Link
            href={ROUTES.live}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 shrink-0"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Ver transmisiones en vivo ahora
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        {/* ────────────────────────────────────────────────────────
            STREAMER / SELLER PROFILE CARD
            ──────────────────────────────────────────────────────── */}
        <div className="relative rounded-3xl border border-border bg-card/60 backdrop-blur-md p-6 md:p-8 shadow-xl overflow-hidden mb-10">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex items-center gap-4 md:gap-5">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-border shadow-md bg-muted flex items-center justify-center text-xl md:text-2xl font-black text-foreground">
                  {seller.avatarUrl ? (
                    <img
                      src={seller.avatarUrl}
                      alt={seller.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    seller.displayName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300">
                  OFFLINE
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                    {seller.displayName}
                  </h1>
                  {seller.isVerified && (
                    <BadgeCheck className="h-5 w-5 text-sky-400 shrink-0" aria-label="Verificado" />
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-0.5">
                  @{seller.username}
                  {seller.department && (
                    <span className="inline-flex items-center gap-1 ml-2 text-muted-foreground/80">
                      <MapPin className="h-3 w-3 text-amber-500" />
                      {seller.department}, Perú
                    </span>
                  )}
                </p>

                {/* Rating & Stats pill */}
                <div className="flex items-center gap-3 mt-2.5 text-xs flex-wrap">
                  <div className="flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{seller.rating ? seller.rating.toFixed(1) : '5.0'}</span>
                    <span className="text-muted-foreground font-normal">
                      ({seller.ratingsCount || 12})
                    </span>
                  </div>

                  <span className="text-muted-foreground font-medium">
                    <strong className="text-foreground">{products.length}</strong> productos
                  </span>

                  <span className="text-muted-foreground font-medium">
                    <strong className="text-foreground">{seller.salesCount || 15}</strong> ventas
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleFollow}
                className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  isFollowing
                    ? 'bg-muted border border-border text-foreground hover:bg-muted/80'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Seguir vendedor
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center p-2.5 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Compartir canal"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>

              <Link
                href={ROUTES.seller(seller.username)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors"
              >
                Ver perfil completo
              </Link>
            </div>
          </div>

          {seller.bio && (
            <div className="mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
              {seller.bio}
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────────────
            PRODUCTOS DEL VENDEDOR (MARKETPLACE)
            ──────────────────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground font-display">
                  Productos del vendedor
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compra directa con Yape, Plin o tarjeta con protección al comprador de VendeYa.
              </p>
            </div>
            <Link
              href={ROUTES.seller(seller.username)}
              className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
            >
              Ver todos ({products.length})
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-foreground">
                El vendedor no tiene productos publicados actualmente
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Visita el marketplace general para encontrar miles de ofertas en directo.
              </p>
              <Link
                href={ROUTES.marketplace}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
              >
                Explorar marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((prod) => {
                const img = safeMainImage(prod.images)
                const price = Number(prod.basePrice ?? prod.price ?? 0)

                return (
                  <div
                    key={prod.id}
                    className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <Link
                      href={ROUTES.product(prod.id)}
                      className="relative aspect-square w-full bg-muted overflow-hidden block"
                    >
                      <img
                        src={img}
                        alt={prod.title}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_IMAGE
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </Link>

                    <div className="p-3.5 flex flex-col flex-1">
                      <Link
                        href={ROUTES.product(prod.id)}
                        className="text-xs md:text-sm font-bold text-foreground hover:text-amber-500 transition-colors line-clamp-2 leading-snug mb-1"
                      >
                        {prod.title}
                      </Link>

                      <div className="text-base font-black text-foreground tabular-nums mt-auto pt-2">
                        {formatPEN(price)}
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/50">
                        <Link
                          href={ROUTES.product(prod.id)}
                          className="flex-1 text-center py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors"
                        >
                          Comprar
                        </Link>
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Agregar al carrito"
                          aria-label="Agregar al carrito"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────
            OTRAS TRANSMISIONES EN VIVO AHORA MISMO
            ──────────────────────────────────────────────────────── */}
        {otherLiveStreams.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-rose-500" />
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground font-display">
                    Otras transmisiones en vivo ahora
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Subastas relámpago y compras en directo sucediendo ahora mismo.
                </p>
              </div>
              <Link
                href={ROUTES.live}
                className="text-xs font-bold text-rose-500 hover:underline inline-flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {otherLiveStreams.map((st) => {
                const cover = safeStreamCover(st)
                const stSeller = st.seller || { displayName: 'Vendedor', username: st.id }

                return (
                  <Link
                    key={st.id}
                    href={ROUTES.stream(st.seller?.username || st.id)}
                    className="group block relative aspect-[9/16] rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Backdrop */}
                    <img
                      src={cover}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-40 pointer-events-none"
                    />
                    <img
                      src={cover}
                      alt={st.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* LIVE Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-rose-600/90 backdrop-blur-md rounded-full px-2 py-0.5 text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
                    </div>

                    {/* Viewers */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 text-white">
                      <Eye className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] font-bold tabular-nums">
                        {formatViewers(st.viewerCount || 1)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <h3 className="text-xs font-bold line-clamp-2 leading-snug mb-1">
                        {st.title}
                      </h3>
                      <div className="text-[10px] text-zinc-300 truncate">
                        {stSeller.displayName}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
