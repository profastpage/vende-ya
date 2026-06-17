'use client'

import * as React from 'react'
import { notFound } from 'next/navigation'
import {
  Radio, MapPin, Calendar, Star, MessageSquare, Share2, Verified,
  ShoppingBag, Heart, Trophy,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES, MOCK_PRODUCTS, MOCK_STREAMS, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers, timeAgoEs, initials } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import Link from 'next/link'

export default function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params)
  const { toast } = useToast()
  const [following, setFollowing] = React.useState(false)

  const seller = MOCK_PROFILES.find((p) => p.username === username)
  if (!seller) notFound()

  const sellerProducts = MOCK_PRODUCTS.filter((p) => p.sellerId === seller.id)
  const sellerAuctions = MOCK_TRENDING_AUCTIONS.filter((a) => a.sellerId === seller.id)
  const sellerStreams = MOCK_STREAMS.filter((s) => s.sellerId === seller.id)

  const breadcrumbs: Breadcrumb[] = [
    { label: 'Vendedores', href: ROUTES.marketplace },
    { label: seller.displayName },
  ]

  const handleFollow = () => {
    setFollowing((v) => !v)
    toast({
      title: following ? '👋 Dejaste de seguir' : '✅ Siguiendo',
      description: seller.displayName,
    })
  }

  return (
    <AppShell
      title={seller.displayName}
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-5xl"
    >
      {/* Profile header */}
      <Card className="overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-br from-salsa-500 to-salsa-700" />
        <div className="p-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-card shrink-0">
              <AvatarImage src={seller.avatarUrl ?? undefined} alt={seller.displayName} />
              <AvatarFallback className="text-2xl">{initials(seller.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display">{seller.displayName}</h1>
                {seller.isVerified && <Verified className="h-5 w-5 text-salsa-500" />}
                {seller.isLiveSeller && (
                  <Badge className="bg-salsa-500 text-white">
                    <Radio className="h-3 w-3 mr-1" /> Live seller
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{seller.username}</p>
              <p className="text-sm mt-1">{seller.bio}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {seller.department}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Desde 2024
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {seller.rating.toFixed(1)}
                  <span className="text-muted-foreground">({seller.ratingsCount})</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={handleFollow}
                className={following ? 'bg-muted text-foreground hover:bg-muted' : 'bg-salsa-500 hover:bg-salsa-600 text-white'}
              >
                <Heart className={`h-4 w-4 mr-2 ${following ? 'fill-current' : ''}`} />
                {following ? 'Siguiendo' : 'Seguir'}
              </Button>
              <Link href={`${ROUTES.mensajes}?u=${seller.username}`}>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" /> Mensaje
                </Button>
              </Link>
              <Button
                variant="outline" size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast({ title: '🔗 Enlace copiado' })
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t">
            <Stat label="Seguidores" value={seller.followerCount.toLocaleString('es-PE')} />
            <Stat label="Ventas" value={seller.salesCount.toString()} />
            <Stat label="Rating" value={`${seller.rating.toFixed(1)} ★`} />
            <Stat label="Streams" value={sellerStreams.length.toString()} />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Productos ({sellerProducts.length})</TabsTrigger>
          <TabsTrigger value="auctions">Subastas ({sellerAuctions.length})</TabsTrigger>
          <TabsTrigger value="streams">Streams ({sellerStreams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {sellerProducts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aún no tiene productos publicados.
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sellerProducts.map((p) => (
                <Link key={p.id} href={ROUTES.product(p.id)}>
                  <Card className="overflow-hidden hover:shadow-soft transition-shadow h-full">
                    <div className="aspect-square bg-muted">
                      {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-2">{p.title}</p>
                      <p className="text-sm font-bold text-salsa-600 mt-1">{formatPEN(p.basePrice)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="auctions">
          {sellerAuctions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aún no tiene subastas.
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sellerAuctions.map((a) => (
                <Link key={a.id} href={ROUTES.auction(a.id)}>
                  <Card className="overflow-hidden hover:shadow-soft transition-shadow h-full">
                    <div className="aspect-square bg-muted relative">
                      {a.product?.images[0] && <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />}
                      {a.status === 'live' && (
                        <Badge className="absolute top-2 left-2 bg-salsa-500 text-white">
                          <Radio className="h-3 w-3 mr-1" /> EN VIVO
                        </Badge>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-2">{a.product?.title}</p>
                      <p className="text-sm font-bold text-salsa-600 mt-1">{formatPEN(a.currentPrice)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="streams">
          {sellerStreams.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Aún no tiene transmisiones.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sellerStreams.map((s) => (
                <Link key={s.id} href={ROUTES.stream(s.id)}>
                  <Card className="overflow-hidden hover:shadow-soft transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {s.thumbnailUrl && <img src={s.thumbnailUrl} alt={s.title} className="h-full w-full object-cover" />}
                      {s.isLive && (
                        <Badge className="absolute top-2 left-2 bg-salsa-500 text-white">
                          <Radio className="h-3 w-3 mr-1" /> EN VIVO
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatViewers(s.viewerCount)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
