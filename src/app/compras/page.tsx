import * as React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag, Package, Truck, ExternalLink, Calendar, MapPin, SearchX, CheckCircle2, MessageCircle } from 'lucide-react'
import { db } from '@/lib/db'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { ROUTES } from '@/lib/vendeda/routes'
import { formatPEN } from '@/lib/vendeda/format'
import { ReviewModal } from './ReviewModal'

export const metadata = {
  title: 'Mis Compras | Vende Ya',
}

export default async function ComprasPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.login + '?redirect=/compras')
  }

  // Fetch all purchases (payments) where the user is the buyer
  const [payments, reviews] = await Promise.all([
    db.payment.findMany({
      where: { buyerId: user.id },
      include: {
        seller: true,
        auction: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.review.findMany({
      where: { reviewerId: user.id }
    })
  ])

  // Map reviews by orderId/paymentId
  const reviewMap = new Map(reviews.map(r => [r.orderId, r]))

  // Calculate metrics
  const totalSpent = payments.reduce((acc, p) => acc + p.amount + p.shippingCost, 0)
  const totalPurchases = payments.length

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border pt-safe">
        <div className="flex items-center gap-3 px-4 h-14">
          <div className="min-w-0 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <h1 className="text-base font-bold font-display truncate text-foreground">Mis Compras</h1>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-600 p-[2px]">
              <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black font-display tracking-tight">Mis Compras</h1>
              <p className="text-muted-foreground text-sm">Historial de productos adquiridos en Vende Ya</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-5 flex flex-col justify-center">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Gastado</p>
            <p className="text-2xl md:text-3xl font-black text-amber-400">{formatPEN(totalSpent)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-5 flex flex-col justify-center">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Compras</p>
            <p className="text-2xl md:text-3xl font-black text-foreground">{totalPurchases}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold font-display mt-8 mb-4">Historial de Transacciones</h2>

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/30">
            <SearchX className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-bold text-foreground">Aún no tienes compras</h3>
            <p className="text-muted-foreground mt-1 text-sm max-w-sm mx-auto">
              Cuando ganes una subasta o compres un producto en el Marketplace o Live Shopping, aparecerán aquí.
            </p>
            <Link href={ROUTES.home} className="inline-flex items-center justify-center mt-6 h-10 px-6 rounded-lg bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => {
              const product = payment.auction?.product
              const title = product?.title || `Pedido #${payment.auctionId?.slice(-6) || payment.id.slice(-6)}`
              const isVerified = payment.status === 'verified'
              const existingReview = reviewMap.get(payment.id)

              let thumbnail = null
              if (product?.images) {
                try {
                  const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
                  if (Array.isArray(imgs) && imgs.length > 0) thumbnail = imgs[0]
                } catch (e) {}
              }

              const waMessage = encodeURIComponent(
                `Hola, soy el comprador de la orden #${payment.id.slice(-6)} en Vende Ya. Te escribo para coordinar el envío por Shalom/Olva.`
              )

              return (
                <div key={payment.id} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row">
                  {/* Photo Thumbnail */}
                  <div className="h-36 md:h-auto md:w-48 bg-muted border-b md:border-b-0 md:border-r border-border shrink-0 relative flex items-center justify-center overflow-hidden">
                    {thumbnail ? (
                      <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground opacity-30" />
                    )}
                    {isVerified && (
                      <div className="absolute top-2 right-2 bg-lime-500/90 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Pagado
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-2">{title}</h3>
                        <div className="text-right shrink-0">
                          <p className="font-black text-amber-400">{formatPEN(payment.amount)}</p>
                          {payment.shippingCost > 0 && (
                            <p className="text-[10px] text-muted-foreground">+ {formatPEN(payment.shippingCost)} envío</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vendido por <Link href={`/vendedores/${payment.seller.username}`} className="font-semibold text-foreground hover:text-amber-400 transition-colors">@{payment.seller.username}</Link>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border mt-auto">
                      <div className="flex items-center gap-3 md:gap-5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(payment.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" />
                          {payment.shippingAddr ? 'Envío coordinado' : 'Retiro en persona'}
                        </div>
                      </div>

                      {/* Action buttons: WhatsApp + Review */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                          title="Coordinar entrega por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Contactar por WhatsApp</span>
                        </a>

                        <ReviewModal
                          orderId={payment.id}
                          sellerId={payment.sellerId}
                          sellerName={payment.seller.displayName || payment.seller.username}
                          productTitle={title}
                          existingReview={existingReview}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}