'use client'

import * as React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Heart, Share2, ShoppingBag, Flag, Verified, Truck, Shield, Minus, Plus, Check,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PRODUCTS } from '@/lib/vendeda/mock-data'
import { formatPEN, initials } from '@/lib/vendeda/format'
import { PAYMENT_METHODS, SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const { toast } = useToast()
  const [qty, setQty] = React.useState(1)
  const [favorited, setFavorited] = React.useState(false)

  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const seller = product.seller
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Marketplace', href: ROUTES.marketplace },
    { label: product.title },
  ]

  const handleBuy = () => {
    toast({
      title: '🛒 Producto añadido al carrito',
      description: `${qty} × ${product.title} = ${formatPEN(product.basePrice * qty)}`,
    })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: '🔗 Enlace copiado' })
    } catch {
      toast({ title: 'No se pudo copiar', variant: 'destructive' })
    }
  }

  return (
    <AppShell
      title={product.title}
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-6xl"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted">
              {product.images[0] && (
                <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
              )}
            </div>
          </Card>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className="aspect-square rounded-md overflow-hidden border-2 border-border hover:border-salsa-300 transition-colors"
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.condition === 'nuevo' ? 'Nuevo' : product.condition}</Badge>
              <Badge variant="outline">{product.shipsNationwide ? 'Envío nacional' : 'Solo local'}</Badge>
            </div>
            <h1 className="text-2xl font-bold font-display">{product.title}</h1>
            <p className="text-3xl font-bold text-salsa-600 mt-2">
              {formatPEN(product.basePrice, product.currency)}
            </p>
            {product.shippingCost === 0 ? (
              <p className="text-sm text-lima-600 font-medium mt-1">🚚 Envío gratis</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Envío: {formatPEN(product.shippingCost)} (Olva / Shalom / Marvisur)
              </p>
            )}
          </div>

          {/* Seller */}
          {seller && (
            <Link href={ROUTES.seller(seller.username)}>
              <Card className="p-3 hover:shadow-soft transition-shadow">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
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
                  <Button size="sm" variant="outline">Ver tienda</Button>
                </div>
              </Card>
            </Link>
          )}

          {/* Quantity + Buy */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold tabular-nums">{qty}</span>
                <Button
                  variant="outline" size="icon" className="h-9 w-9"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{product.stock} disponibles</p>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleBuy} className="bg-salsa-500 hover:bg-salsa-600 text-white h-12">
                <ShoppingBag className="h-4 w-4 mr-2" /> Comprar
              </Button>
              <Button
                variant="outline"
                onClick={() => setFavorited((v) => !v)}
                className={`h-12 ${favorited ? 'text-salsa-600 border-salsa-300 bg-salsa-50' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-2 ${favorited ? 'fill-current' : ''}`} />
                {favorited ? 'Guardado' : 'Favorito'}
              </Button>
            </div>
            <Button variant="ghost" onClick={handleShare} className="w-full text-xs">
              <Share2 className="h-3 w-3 mr-1" /> Compartir
            </Button>
          </Card>

          {/* Description */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 text-sm">Descripción</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          </Card>

          {/* Payments */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-lima-500" /> Métodos de pago
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.paymentMethods.map((pmId) => {
                const pm = PAYMENT_METHODS[pmId as keyof typeof PAYMENT_METHODS]
                if (!pm) return null
                return (
                  <Badge key={pmId} variant="outline" className="text-xs">
                    {pm.label}
                  </Badge>
                )
              })}
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <Truck className="h-4 w-4 text-salsa-500" /> Envíos
            </h3>
            <div className="space-y-1.5 text-xs">
              {SHIPPING_CARRIERS.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span>{c.label}</span>
                  <span className="text-muted-foreground">{c.estDays}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
