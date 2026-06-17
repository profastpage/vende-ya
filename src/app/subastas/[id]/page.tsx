'use client'

import * as React from 'react'
import { notFound } from 'next/navigation'
import { Radio, Eye, Heart, Share2, ShoppingBag, Flag, Verified, Truck, Shield } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { LiveBiddingContainer } from '@/components/vendeda/LiveBiddingContainer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import {
  MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers, initials } from '@/lib/vendeda/format'
import { PAYMENT_METHODS, SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import Link from 'next/link'

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { toast } = useToast()

  // Find auction by ID (mock lookup; in prod: fetch from DB)
  const auction =
    MOCK_TRENDING_AUCTIONS.find((a) => a.id === id) ??
    (id === 'a1' ? MOCK_AUCTION : null)

  if (!auction) notFound()

  const product = auction.product
  const seller = auction.seller

  const breadcrumbs: Breadcrumb[] = [
    { label: 'Subastas', href: ROUTES.live },
    { label: product?.title ?? 'Subasta' },
  ]

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: '🔗 Enlace copiado', description: url })
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  return (
    <AppShell
      title={product?.title}
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-6xl"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main column — live bidding */}
        <div className="md:col-span-2 space-y-4">
          <LiveBiddingContainer
            auction={auction}
            currentUser={MOCK_PROFILES[5]}
            streamPosterUrl={auction.stream?.thumbnailUrl}
            streamPlaybackId={auction.stream?.playbackId}
            initialBids={MOCK_BIDS}
            initialChat={MOCK_CHAT}
          />

          {/* Description */}
          <Card className="p-5">
            <h2 className="font-semibold mb-2">Descripción</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {product?.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Condición</p>
                <p className="font-medium">{product?.condition}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-medium">{product?.stock} unidades</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Envía desde</p>
                <p className="font-medium">{product?.shippingFrom}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Envío</p>
                <p className="font-medium">{product?.shipsNationwide ? 'Todo Perú' : 'Solo local'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column — seller + payments + shipping */}
        <div className="space-y-4">
          {/* Seller card */}
          {seller && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3">Vendedor</h3>
              <Link href={ROUTES.seller(seller.username)} className="flex items-center gap-3 hover:bg-muted/50 -m-2 p-2 rounded-lg transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
                  <AvatarFallback>{initials(seller.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm truncate">{seller.displayName}</span>
                    {seller.isVerified && <Verified className="h-3.5 w-3.5 text-salsa-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ⭐ {seller.rating.toFixed(1)} · {seller.salesCount} ventas
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 mt-3">
                <Link href={`${ROUTES.mensajes}?u=${seller.username}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Mensaje</Button>
                </Link>
                <Button variant="outline" size="sm" className="flex-1">Seguir</Button>
              </div>
            </Card>
          )}

          {/* Payment methods */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-lima-500" /> Pagos aceptados
            </h3>
            <div className="space-y-2">
              {product?.paymentMethods.map((pmId) => {
                const pm = PAYMENT_METHODS[pmId as keyof typeof PAYMENT_METHODS]
                if (!pm) return null
                return (
                  <div key={pmId} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: pm.color }}
                    >
                      {pm.label.charAt(0)}
                    </div>
                    <span>{pm.label}</span>
                    {pmId === 'yape' || pmId === 'plin' ? (
                      <Badge variant="secondary" className="text-[9px] ml-auto">Instantáneo</Badge>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-salsa-500" /> Opciones de envío
            </h3>
            <div className="space-y-2 text-sm">
              {SHIPPING_CARRIERS.map((carrier) => (
                <div key={carrier.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: carrier.color }}
                    />
                    <span>{carrier.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{carrier.estDays}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Costo envío</span>
                <span className="text-sm font-semibold">
                  {product?.shippingCost === 0 ? 'Gratis' : formatPEN(product?.shippingCost ?? 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Safety */}
          <Card className="p-5 bg-lima-50 border-lima-200">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-lima-900">
              <Shield className="h-4 w-4 text-lima-600" /> Compra protegida
            </h3>
            <ul className="text-xs text-lima-800 space-y-1">
              <li>✓ Pago en escrow hasta confirmar recepción</li>
              <li>✓ Reembolso si el producto no coincide</li>
              <li>✓ Mediación de disputas en 48h</li>
            </ul>
            <button
              onClick={() => toast({ title: '🚩 Reporte enviado', description: 'El equipo revisará.' })}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 mt-3"
            >
              <Flag className="h-3 w-3" /> Reportar esta subasta
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
