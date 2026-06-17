'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Radio, TrendingUp, Flame, ChevronRight, Sparkles, Zap, ChevronLeft,
  Share2, Link2, Check,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LiveBiddingContainer } from '@/components/vendeda/LiveBiddingContainer'
import { MobileBottomNav } from '@/components/vendeda/MobileBottomNav'
import { DesktopTopNav } from '@/components/vendeda/DesktopTopNav'
import { CategorySidebar, CategoryRail } from '@/components/vendeda/CategorySidebar'
import { QuickAuctionFab } from '@/components/vendeda/QuickAuctionFab'
import { SectionNav, ScrollToTopButton, SECTIONS } from '@/components/vendeda/SectionNav'
import {
  AuctionCard, ProductCard, LiveStreamCard, SellerChip,
} from '@/components/vendeda/cards'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_PRODUCTS,
  MOCK_STREAMS, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers } from '@/lib/vendeda/format'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

/**
 * SectionHeading — renders a consistent h2 with an anchor + share button.
 * The `id` becomes the deep-link target (e.g. /#marketplace).
 * Click the link icon to copy the shareable URL.
 */
function SectionHeading({
  id, icon: Icon, iconColor = 'text-salsa-500',
  title, subtitle, action,
}: {
  id: string
  icon: React.ElementType
  iconColor?: string
  title: string
  subtitle?: React.ReactNode
  action?: React.ReactNode
}) {
  const [copied, setCopied] = React.useState(false)
  const { toast } = useToast()

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({ title: '🔗 Enlace copiado', description: url })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  return (
    <div className="flex items-center justify-between mb-3 scroll-mt-20">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
        <h2 className="text-lg md:text-xl font-bold font-display truncate">{title}</h2>
        {subtitle}
        {/* Anchor link — hover to reveal */}
        <button
          onClick={copyLink}
          className="ml-1 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label={`Copiar enlace a ${title}`}
          title="Copiar enlace directo"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-lima-500" /> : <Link2 className="h-3.5 w-3.5" />}
        </button>
      </div>
      {action}
    </div>
  )
}

export default function Home() {
  const [activeCategory, setActiveCategory] = React.useState('all')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop top nav */}
      <DesktopTopNav />

      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-bold text-base font-display">{APP_NAME}</span>
          </Link>
          <Link
            href={ROUTES.live}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-salsa-50 text-salsa-700"
          >
            <span className="live-dot" />
            <span className="text-xs font-bold">EN VIVO</span>
            <span className="text-[10px] bg-salsa-200 text-salsa-800 rounded-full px-1.5 font-bold">3</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-4 pb-24 md:pb-12">
        {/* ============================================================= */}
        {/* HERO — Live auction feature (deep-linkable: /#hero) */}
        {/* ============================================================= */}
        <section
          id="hero"
          aria-label="Subasta en vivo destacada"
          className="mb-6 md:mb-10 scroll-mt-20"
        >
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="live-dot" />
                <span className="text-xs font-bold uppercase tracking-wider text-salsa-600">
                  Subasta en vivo ahora
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold font-display tracking-tight">
                {MOCK_AUCTION.product?.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                Subasta en vivo con <span className="font-semibold text-foreground">{MOCK_AUCTION.seller?.displayName}</span>{' '}
                · {formatViewers(MOCK_AUCTION.stream?.viewerCount ?? 0)} · Paga con Yape / Plin
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="border-salsa-300 text-salsa-700 bg-salsa-50">
                <Flame className="h-3 w-3 mr-1" /> Trending
              </Badge>
              <Link href={ROUTES.live}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
              </Link>
              <Link href={ROUTES.live}>
                <Button variant="outline" size="sm">
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <LiveBiddingContainer
            auction={MOCK_AUCTION}
            currentUser={MOCK_PROFILES[5]}
            streamPosterUrl={MOCK_AUCTION.stream?.thumbnailUrl}
            streamPlaybackId={MOCK_AUCTION.stream?.playbackId}
            initialBids={MOCK_BIDS}
            initialChat={MOCK_CHAT}
          />
        </section>

        {/* ============================================================= */}
        {/* SELLERS — deep-linkable: /#sellers */}
        {/* ============================================================= */}
        <section
          id="sellers"
          aria-label="Vendedores en tendencia"
          className="mb-6 md:mb-10 scroll-mt-20"
        >
          <SectionHeading
            id="sellers"
            icon={TrendingUp}
            title="Vendedores en tendencia"
            action={
              <Link href={`${ROUTES.marketplace}?filter=sellers`}>
                <Button variant="ghost" size="sm" className="text-salsa-600">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2">
            {MOCK_PROFILES.slice(0, 5).map((p) => (
              <SellerChip key={p.id} profile={p} />
            ))}
          </div>
        </section>

        {/* ============================================================= */}
        {/* MARKETPLACE — composite section: live-rail + auctions + products */}
        {/* Deep-linkable: /#marketplace, /#live-rail, /#products */}
        {/* ============================================================= */}
        <section
          id="marketplace"
          aria-label="Marketplace"
          className="flex gap-6 scroll-mt-20"
        >
          {/* Desktop categories sidebar */}
          <CategorySidebar active={activeCategory} onSelect={setActiveCategory} />

          {/* Feed grid */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Live now rail */}
            <div id="live-rail" className="scroll-mt-20">
              <SectionHeading
                id="live-rail"
                icon={Radio}
                title="En vivo ahora"
                subtitle={
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    {MOCK_STREAMS.filter(s => s.isLive).length} transmisiones
                  </span>
                }
                action={
                  <Link href={ROUTES.live}>
                    <Button variant="ghost" size="sm" className="text-salsa-600">
                      Ver todo <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-2">
                {MOCK_STREAMS.filter(s => s.isLive).map((s) => (
                  <LiveStreamCard key={s.id} stream={s} />
                ))}
              </div>
            </div>

            {/* Mobile category rail */}
            <CategoryRail active={activeCategory} onSelect={setActiveCategory} />

            {/* Active auctions grid */}
            <div id="auctions" className="scroll-mt-20">
              <SectionHeading
                id="auctions"
                icon={Zap}
                iconColor="text-lima-500"
                title="Subastas activas"
                subtitle={
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                    <Sparkles className="h-3 w-3 text-plin-500" />
                    <span>AI moderado</span>
                  </div>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {MOCK_TRENDING_AUCTIONS.map((a) => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            </div>

            {/* Marketplace products */}
            <div id="products" className="scroll-mt-20">
              <SectionHeading
                id="products"
                icon={TrendingUp}
                title="Productos del marketplace"
                action={
                  <Link href={ROUTES.marketplace}>
                    <Button variant="ghost" size="sm" className="text-salsa-600">
                      Ver todo <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {MOCK_PRODUCTS.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop right rail: trending + payments */}
          <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
            <div className="rounded-2xl border bg-card p-4 shadow-soft">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-salsa-500" />
                Más pujado hoy
              </h3>
              <div className="space-y-2">
                {MOCK_TRENDING_AUCTIONS.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                      {a.product?.images[0] && (
                        <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{a.product?.title}</p>
                      <p className="text-xs text-salsa-600 font-bold tabular-nums">
                        {formatPEN(a.currentPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-salsa-500 to-salsa-700 p-4 text-white shadow-glow-salsa">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Métodos de pago
              </h3>
              <p className="text-xs text-white/80 mb-3">
                Paga tus subastas en segundos, 24/7.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'yape',  label: 'Yape',          color: '#7B2C8C' },
                  { id: 'plin',  label: 'Plin',          color: '#00B4D8' },
                  { id: 'pagof', label: 'PagoEfectivo',  color: '#FF5A1F' },
                  { id: 'card',  label: 'Tarjeta',       color: '#64748B' },
                ].map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-center"
                    style={{ backgroundColor: `${p.color}30`, color: '#fff', border: `1px solid ${p.color}` }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-soft">
              <h3 className="text-sm font-bold mb-2">🚚 Envíos a todo Perú</h3>
              <p className="text-xs text-muted-foreground">
                Olva · Shalom · Marvisur · Recojo en tienda.
                <br /><br />
                Coordina con el vendedor al cerrar la subasta por WhatsApp.
              </p>
            </div>
          </aside>
        </section>

        {/* ============================================================= */}
        {/* ARCHITECTURE — deep-linkable: /#architecture */}
        {/* ============================================================= */}
        <section
          id="architecture"
          aria-label="Arquitectura del MVP"
          className="hidden md:block mt-12 rounded-2xl border border-dashed bg-muted/30 p-6 scroll-mt-20"
        >
          <SectionHeading
            id="architecture"
            icon={Sparkles}
            iconColor="text-plin-500"
            title="MVP Core Bootstrap — Architecture Summary"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-semibold text-foreground mb-1">Frontend</div>
              <p className="text-muted-foreground">
                Next.js 16 App Router · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion. Mobile-first, safe-area aware, Core Web Vitals optimized.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">Real-time</div>
              <p className="text-muted-foreground">
                Socket.io mini-service (port 3003) for bids + chat. In prod: Supabase Realtime replication of <code>bids</code> + <code>live_chat_messages</code>.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">Database</div>
              <p className="text-muted-foreground">
                Supabase PostgreSQL with RLS on every user-generated table. <code>place_bid()</code> RPC prevents race conditions. See <code>/docs/supabase-schema.sql</code>.
              </p>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">AI Edge</div>
              <p className="text-muted-foreground">
                DeepSeek-V4 (moderation) + Qwen-2.5-72B (sales assistant) via z-ai-web-dev-sdk. Rule-based prefilter at zero token cost.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating section nav (scroll spy + deep linking UI) */}
      <SectionNav />
      <ScrollToTopButton />

      {/* FAB */}
      <QuickAuctionFab />

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Footer */}
      <footer
        id="footer"
        className="hidden md:block mt-auto border-t bg-card/50 scroll-mt-20"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span>© 2026 Vende Ya · Hecho en Perú 🇵🇪</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.terminos} className="hover:text-foreground">Términos</Link>
            <Link href={ROUTES.privacidad} className="hover:text-foreground">Privacidad</Link>
            <Link href={ROUTES.soporte} className="hover:text-foreground">Soporte</Link>
            <Link href={ROUTES.envios} className="hover:text-foreground">Olva tracking</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
