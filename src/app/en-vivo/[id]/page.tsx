'use client'

import * as React from 'react'
import { notFound } from 'next/navigation'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { LiveBiddingContainer } from '@/components/vendeda/LiveBiddingContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_STREAMS, MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { ROUTES } from '@/lib/vendeda/routes'
import { formatViewers } from '@/lib/vendeda/format'

export default function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const stream = MOCK_STREAMS.find((s) => s.id === id)
  if (!stream) notFound()

  // Find an active auction in this stream (or default mock auction)
  const auction = MOCK_TRENDING_AUCTIONS.find((a) => a.streamId === id) ?? MOCK_AUCTION

  const breadcrumbs: Breadcrumb[] = [
    { label: 'En vivo', href: ROUTES.live },
    { label: stream.title.slice(0, 40) + (stream.title.length > 40 ? '…' : '') },
  ]

  return (
    <AppShell
      title={stream.title}
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-6xl"
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <LiveBiddingContainer
            auction={auction}
            currentUser={MOCK_PROFILES[5]}
            streamPosterUrl={stream.thumbnailUrl}
            streamPlaybackId={stream.playbackId}
            initialBids={MOCK_BIDS}
            initialChat={MOCK_CHAT}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Sobre esta transmisión</h3>
            <p className="text-sm text-muted-foreground">{stream.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge className={stream.isLive ? 'bg-salsa-500' : 'bg-muted'}>
                  {stream.isLive ? 'EN VIVO' : stream.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Espectadores pico</p>
                <p className="font-semibold">{stream.peakViewerCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Likes</p>
                <p className="font-semibold">{stream.likeCount.toLocaleString('es-PE')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compartidos</p>
                <p className="font-semibold">{stream.shareCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-salsa-50 border-salsa-200">
            <h3 className="font-semibold mb-2 text-salsa-900">🔔 No te pierdas la próxima</h3>
            <p className="text-sm text-salsa-800 mb-3">
              Activa notificaciones para saber cuando {stream.seller?.displayName} vuelve a estar en vivo.
            </p>
            <button className="w-full bg-salsa-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-salsa-600">
              Activar campanita 🔔
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
