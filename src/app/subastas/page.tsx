import * as React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Gavel, Clock, Flame, ShieldCheck, ArrowRight, Eye, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatPEN } from '@/lib/vendeda/format'
import { safeMainImage, DEFAULT_STREAM_COVER } from '@/lib/vendeda/images'
import { ROUTES } from '@/lib/vendeda/routes'

export const metadata: Metadata = {
  title: 'Subastas en Vivo y Relámpago — Vende Ya Perú',
  description: 'Participa en subastas relámpago en vivo desde S/ 1. Puja en tiempo real, paga seguro con Yape y Plin y recibe envíos a todo el Perú.',
}

export const dynamic = 'force-dynamic'

export default async function SubastasHubPage() {
  let dbAuctions: any[] = []

  try {
    dbAuctions = await db.auction.findMany({
      where: {
        status: { in: ['live', 'active', 'scheduled'] },
      },
      include: {
        product: true,
        seller: true,
        stream: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })
  } catch (err) {
    console.error('[SubastasHub] Error fetching auctions:', err)
  }

  // If database has auctions, format them; otherwise fallback to mock auctions
  const auctions = dbAuctions.length > 0
    ? dbAuctions.map((a) => {
        const cover = safeMainImage(a.product?.images || a.stream?.thumbnailUrl)
        return {
          id: a.id,
          title: a.product?.title || a.stream?.title || 'Subasta en vivo',
          sellerName: a.seller?.displayName || 'Vendedor Verificado',
          sellerUsername: a.seller?.username || 'vendedor',
          sellerDepartment: a.seller?.department || 'Lima',
          currentPrice: a.currentPrice || a.startingPrice || 1,
          startingPrice: a.startingPrice || 1,
          bidCount: a.bidCount || 0,
          isLive: a.status === 'live',
          image: cover,
          href: a.stream?.id ? ROUTES.stream(a.stream.id) : ROUTES.auction(a.id),
        }
      })
    : MOCK_TRENDING_AUCTIONS.map((a) => ({
        id: a.id,
        title: a.product?.title || 'Subasta relámpago',
        sellerName: a.seller?.displayName || 'Vendedor',
        sellerUsername: a.seller?.username || 'vendedor',
        sellerDepartment: a.seller?.department || 'Lima',
        currentPrice: a.currentPrice || a.startingPrice,
        startingPrice: a.startingPrice,
        bidCount: a.bidCount || 1,
        isLive: a.status === 'live',
        image: safeMainImage(a.product?.images),
        href: ROUTES.auction(a.id),
      }))

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 md:pb-16 pt-4 md:pt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5" />
              Subastas en Directo
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
              Subastas Relámpago
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl leading-relaxed">
              Puja en segundos desde S/ 1. Compras protegidas con garantía Vende Ya, pagos instantáneos con Yape y Plin, y despacho seguro por Shalom y Olva.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.vender}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-black text-xs md:text-sm px-5 py-2.5 rounded-full shadow-lg shadow-fuchsia-500/20 transition-transform active:scale-95"
            >
              <Gavel className="w-4 h-4" />
              Crear una subasta
            </Link>
          </div>
        </div>

        {/* Auctions Grid */}
        {auctions.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card/50 p-8">
            <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
            <h2 className="text-lg font-bold text-foreground">No hay subastas activas en este momento</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
              Sé el primero en iniciar una subasta en vivo y vender a miles de compradores conectados en todo el Perú.
            </p>
            <Link
              href={ROUTES.vender}
              className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-amber-300 transition-colors"
            >
              Comenzar a subastar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {auctions.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex flex-col rounded-2xl bg-card/70 border border-border hover:border-amber-400/30 overflow-hidden shadow-lg shadow-black/20 hover:shadow-amber-500/10 transition-all duration-300"
              >
                {/* Media banner */}
                <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Badge */}
                  {item.isLive ? (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-md border border-rose-300/30 rounded-full px-2.5 py-1">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        En vivo
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-border rounded-full px-2.5 py-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-zinc-300">
                        Relámpago
                      </span>
                    </div>
                  )}

                  {/* Bid Count */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-border rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Gavel className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-white tabular-nums">
                      {item.bidCount} {item.bidCount === 1 ? 'puja' : 'pujas'}
                    </span>
                  </div>

                  {/* Current price on image bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Puja actual
                      </p>
                      <p className="text-xl font-black text-amber-400 font-mono drop-shadow-md">
                        {formatPEN(item.currentPrice)}
                      </p>
                    </div>
                    <div className="h-8 px-3 rounded-full bg-amber-400 group-hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-1 shadow-lg transition-colors">
                      Pujar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Body info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-zinc-300 truncate max-w-[140px]">
                      {item.sellerName}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {item.sellerDepartment}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
