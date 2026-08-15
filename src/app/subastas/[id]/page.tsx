'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Radio, Eye, Heart, Share2, Flag, Verified, Truck, Shield, Zap,
  ChevronRight, MessageSquare, Gavel, Users, Clock, Play,
} from 'lucide-react'
import { LiveBiddingContainer } from '@/components/vendeda/LiveBiddingContainer'
import CheckoutBottomSheet from '@/components/vendeda/CheckoutBottomSheet'
import { useToast } from '@/hooks/use-toast'
import {
  MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers, initials, timeAgoEs } from '@/lib/vendeda/format'
import { PAYMENT_METHODS, SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import {
  GlassCard, GradientButton, GhostButton, StatusBadge,
  staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { toast } = useToast()
  const [checkoutOpen, setCheckoutOpen] = React.useState(false)
  const [favorited, setFavorited] = React.useState(false)

  // Find auction by ID (mock lookup; in prod: fetch from DB)
  const auction =
    MOCK_TRENDING_AUCTIONS.find((a) => a.id === id) ??
    (id === 'a1' ? MOCK_AUCTION : null)

  if (!auction) notFound()

  const product = auction.product
  const seller = auction.seller
  const stream = auction.stream
  const isLive = auction.status === 'live' && stream?.isLive

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: '🔗 Enlace copiado', description: url })
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  // Time-to-end display
  const endsAt = auction.endsAt ? new Date(auction.endsAt).getTime() : 0
  const secondsLeft = Math.max(0, Math.floor((endsAt - Date.now()) / 1000))
  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const countdownStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  const urgent = secondsLeft > 0 && secondsLeft < 30

  const recentBids = MOCK_BIDS.slice().reverse().slice(0, 4)

  const breadcrumbs = [
    { label: 'Subastas', href: ROUTES.live },
    { label: product?.title ?? 'Subasta' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
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

        {/* Live status banner */}
        {isLive && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-fuchsia-500/10 to-rose-500/15 border border-rose-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="text-xs font-black text-rose-300 uppercase tracking-wider">En vivo</span>
            <span className="text-zinc-500">·</span>
            <span className="text-xs text-zinc-300 flex items-center gap-1">
              <Eye className="h-3 w-3" /> {stream ? formatViewers(stream.viewerCount) : '0 espectadores'}
            </span>
            {stream && (
              <span className="text-xs text-zinc-500 ml-auto hidden sm:flex items-center gap-1">
                <Users className="h-3 w-3" /> {auction.watcherCount} pujantes
              </span>
            )}
          </div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Main column — live bidding + description */}
          <div className="md:col-span-2 space-y-4">
            <motion.div variants={staggerItem}>
              <LiveBiddingContainer
                auction={auction}
                currentUser={MOCK_PROFILES[5]}
                streamPosterUrl={auction.stream?.thumbnailUrl}
                streamPlaybackId={auction.stream?.playbackId}
                initialBids={MOCK_BIDS}
                initialChat={MOCK_CHAT}
              />
            </motion.div>

            {/* Hero summary card — auction image + key bid stats */}
            <motion.div
              variants={staggerItem}
              className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square md:aspect-auto bg-zinc-800">
                  {product?.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {isLive && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/90 backdrop-blur-sm">
                      <Radio className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
                        En vivo
                      </span>
                    </div>
                  )}
                </div>
                {/* Stats */}
                <div className="p-5 md:p-6 flex flex-col gap-4">
                  <div>
                    <h1 className="text-lg md:text-xl font-black text-white leading-tight">
                      {product?.title}
                    </h1>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <Gavel className="h-3 w-3" /> {auction.bidCount} pujas · {auction.watcherCount} observadores
                    </p>
                  </div>

                  {/* Current bid */}
                  <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-fuchsia-500/10 border border-amber-400/20 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                      Puja actual
                    </p>
                    <p className="text-4xl font-black text-amber-400 tabular-nums leading-none mt-1">
                      {formatPEN(auction.currentPrice, auction.currency)}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      Incremento mínimo: <span className="font-bold text-white">{formatPEN(auction.bidIncrement)}</span>
                    </p>
                  </div>

                  {/* Countdown */}
                  <div className={`rounded-xl border p-4 transition-colors ${
                    urgent
                      ? 'bg-rose-500/15 border-rose-500/40 animate-pulse'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <p className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${
                      urgent ? 'text-rose-300' : 'text-zinc-400'
                    }`}>
                      <Clock className="h-3 w-3" /> Termina en
                    </p>
                    <p className={`text-3xl font-black tabular-nums mt-1 ${
                      urgent ? 'text-rose-300' : 'text-white'
                    }`}>
                      {countdownStr}
                    </p>
                  </div>

                  {/* Buy now CTA */}
                  {auction.buyNowPrice && (
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Comprar ya</p>
                        <p className="text-lg font-black text-fuchsia-400 tabular-nums">
                          {formatPEN(auction.buyNowPrice)}
                        </p>
                      </div>
                      <GradientButton
                        onClick={() => setCheckoutOpen(true)}
                        className="h-11 px-4 text-sm"
                      >
                        <Zap className="h-4 w-4" /> Comprar ahora
                      </GradientButton>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Bid history list */}
            <motion.div
              variants={staggerItem}
              className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5"
            >
              <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <Gavel className="h-4 w-4 text-amber-400" /> Historial de pujas
              </h3>
              <div className="space-y-1.5">
                {recentBids.map((bid, i) => (
                  <div
                    key={bid.id}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
                      bid.isWinning
                        ? 'bg-gradient-to-r from-amber-400/15 to-fuchsia-500/15 border border-amber-400/30'
                        : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 p-0.5 shrink-0">
                      <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {bid.bidder?.avatarUrl ? (
                          <img src={bid.bidder.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-white">
                            {initials(bid.bidder?.displayName ?? '?')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white flex-1 min-w-0 truncate">
                      {bid.bidder?.displayName ?? 'Anónimo'}
                    </span>
                    {bid.isWinning && (
                      <StatusBadge variant="amber">Ganadora</StatusBadge>
                    )}
                    <span className="text-sm font-black text-amber-400 tabular-nums">
                      {formatPEN(bid.amount, bid.currency)}
                    </span>
                    <span className="text-[10px] text-zinc-500 tabular-nums hidden sm:inline">
                      {timeAgoEs(bid.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              variants={staggerItem}
              className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5"
            >
              <h2 className="text-base font-black text-white mb-2">Descripción</h2>
              <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                {product?.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/5 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Condición</p>
                  <p className="font-bold text-white mt-0.5 capitalize">{product?.condition}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Stock</p>
                  <p className="font-bold text-white mt-0.5">{product?.stock} unidades</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Envía desde</p>
                  <p className="font-bold text-white mt-0.5">{product?.shippingFrom}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Cobertura</p>
                  <p className="font-bold text-white mt-0.5">
                    {product?.shipsNationwide ? 'Todo Perú' : 'Solo local'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column — seller + chat + CTAs */}
          <div className="space-y-4">
            {/* "Ver en vivo" CTA — only if stream is live */}
            {isLive && stream && (
              <motion.div variants={staggerItem}>
                <Link href={ROUTES.stream(stream.id)}>
                  <div className="rounded-2xl bg-gradient-to-br from-rose-500/20 via-fuchsia-900/30 to-zinc-950 border border-rose-500/30 p-5 cursor-pointer hover:border-rose-500/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                      </span>
                      <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider">
                        Stream activo
                      </span>
                    </div>
                    <p className="text-sm font-black text-white mb-1">{stream.title}</p>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mb-3">
                      <Eye className="h-3 w-3" /> {formatViewers(stream.viewerCount)}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-300">
                      <Play className="h-3.5 w-3.5 fill-rose-300" /> Ver en vivo →
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Seller chip */}
            {seller && (
              <motion.div variants={staggerItem}>
                <GlassCard className="p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Vendedor
                  </h3>
                  <Link
                    href={ROUTES.seller(seller.username)}
                    className="flex items-center gap-3 -m-1 p-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
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
                      <div className="text-xs text-zinc-400">
                        ⭐ {seller.rating.toFixed(1)} · {seller.salesCount} ventas
                      </div>
                    </div>
                  </Link>
                  <div className="flex gap-2 mt-3">
                    <Link href={`${ROUTES.mensajes}?u=${seller.username}`} className="flex-1">
                      <GhostButton className="w-full h-9 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" /> Mensaje
                      </GhostButton>
                    </Link>
                    <GhostButton
                      onClick={() => setFavorited((v) => !v)}
                      className={`flex-1 h-9 text-xs ${favorited ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' : ''}`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-current' : ''}`} />
                      {favorited ? 'Siguiendo' : 'Seguir'}
                    </GhostButton>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Chat preview */}
            <motion.div variants={staggerItem}>
              <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-fuchsia-400" /> Chat en vivo
                  </h3>
                  <span className="text-[10px] font-bold text-lime-300 bg-lime-400/15 border border-lime-400/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    Activo
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {MOCK_CHAT.slice(0, 3).map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-amber-400 shrink-0">
                        {msg.sender?.displayName ?? msg.guestName ?? 'Anónimo'}:
                      </span>
                      <span className="text-zinc-300 line-clamp-2 flex-1">{msg.content}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={stream ? ROUTES.stream(stream.id) : ROUTES.live}
                  className="block text-center text-xs font-bold text-amber-400 hover:text-amber-300 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Ver chat completo →
                </Link>
              </div>
            </motion.div>

            {/* Payment methods */}
            <motion.div variants={staggerItem}>
              <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5">
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-lime-400" /> Pagos aceptados
                </h3>
                <div className="space-y-2">
                  {product?.paymentMethods.map((pmId) => {
                    const pm = PAYMENT_METHODS[pmId as keyof typeof PAYMENT_METHODS]
                    if (!pm) return null
                    return (
                      <div key={pmId} className="flex items-center gap-2 text-sm">
                        <div
                          className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: pm.color }}
                        >
                          {pm.label.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{pm.label}</span>
                        {(pmId === 'yape' || pmId === 'plin') && (
                          <StatusBadge variant="lime" className="ml-auto">Instantáneo</StatusBadge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Shipping */}
            <motion.div variants={staggerItem}>
              <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5">
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-400" /> Opciones de envío
                </h3>
                <div className="space-y-2 text-sm">
                  {SHIPPING_CARRIERS.map((carrier) => (
                    <div key={carrier.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: carrier.color }}
                        />
                        <span className="text-white">{carrier.label}</span>
                      </div>
                      <span className="text-xs text-zinc-500">{carrier.estDays}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Costo envío</span>
                    <span className="text-sm font-bold text-amber-400">
                      {product?.shippingCost === 0 ? 'Gratis' : formatPEN(product?.shippingCost ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Safety */}
            <motion.div variants={staggerItem}>
              <div className="rounded-2xl bg-gradient-to-br from-lime-500/10 via-zinc-900/80 to-zinc-950 border border-lime-400/20 p-5">
                <h3 className="text-sm font-black text-lime-300 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-lime-400" /> Compra protegida
                </h3>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-lime-400 mt-0.5">✓</span>
                    <span>Pago en escrow hasta confirmar recepción</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-lime-400 mt-0.5">✓</span>
                    <span>Reembolso si el producto no coincide</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-lime-400 mt-0.5">✓</span>
                    <span>Mediación de disputas en 48h</span>
                  </li>
                </ul>
                <button
                  onClick={() =>
                    toast({ title: '🚩 Reporte enviado', description: 'El equipo revisará.' })
                  }
                  className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 mt-3 transition-colors"
                >
                  <Flag className="h-3 w-3" /> Reportar esta subasta
                </button>
              </div>
            </motion.div>

            {/* Share + favorite row */}
            <motion.div variants={staggerItem} className="flex gap-2">
              <GhostButton onClick={handleShare} className="flex-1 h-11 text-xs">
                <Share2 className="h-4 w-4" /> Compartir
              </GhostButton>
              <GhostButton
                onClick={() => setFavorited((v) => !v)}
                className={`flex-1 h-11 text-xs ${favorited ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' : ''}`}
              >
                <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
                {favorited ? 'Guardado' : 'Guardar'}
              </GhostButton>
            </motion.div>
          </div>
        </motion.div>

        {/* Checkout Bottom Sheet */}
        <CheckoutBottomSheet
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          productId={product?.id ?? id}
          productName={product?.title ?? 'Subasta'}
          price={auction.buyNowPrice ?? auction.currentPrice}
          source="live_stream"
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
            packageDescription: product?.title ?? 'Subasta',
            weightKg: 0.5,
            declaredValue: auction.buyNowPrice ?? auction.currentPrice,
          }}
        />
      </div>
    </div>
  )
}
