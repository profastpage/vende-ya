'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Radio, MapPin, Calendar, Star, MessageSquare, Share2, Verified,
  ShoppingBag, Heart, Trophy, ChevronRight, Award, Package, Users, Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  MOCK_PROFILES, MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS,
} from '@/lib/vendeda/mock-data'
import { formatPEN, formatViewers, timeAgoEs, initials } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import {
  GlassCard, GradientButton, GhostButton, StatusBadge,
  staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'

type TabId = 'products' | 'auctions' | 'reviews' | 'about'

interface SellerReview {
  id: string
  name: string
  avatar?: string
  rating: number
  date: string
  text: string
  productTitle?: string
}

const SELLER_REVIEWS: SellerReview[] = [
  {
    id: 'sr1',
    name: 'Lucía M.',
    rating: 5,
    date: 'hace 2 días',
    text: 'Excelente vendedora, todo tal cual las fotos. Envío súper rápido a Arequipa, llegó en 1 día por Shalom. Volveré a comprar.',
    productTitle: 'Polo algodón pima — edición Lima',
  },
  {
    id: 'sr2',
    name: 'Diego R.',
    rating: 5,
    date: 'hace 1 semana',
    text: 'Compré en subasta en vivo y todo fue súper transparente. El producto llegó con boleta y garantía. Rosa contesta rápido por chat.',
    productTitle: 'Vestido artesanal — bordado a mano',
  },
  {
    id: 'sr3',
    name: 'Carmen T.',
    rating: 4,
    date: 'hace 2 semanas',
    text: 'Buen producto, demoró un poco más de lo acordado pero la vendedora se comunicó enseguida y me compensó con un detalle. Recomendada.',
    productTitle: 'Polo algodón pima — edición Lima',
  },
  {
    id: 'sr4',
    name: 'Andrés P.',
    rating: 5,
    date: 'hace 3 semanas',
    text: 'Compré 5 polos para revender y me dieron precio mayorista. Calidad de algodón pima peruano real. Excelente atención por WhatsApp.',
    productTitle: 'Polo algodón pima — edición Lima',
  },
]

export default function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params)
  const { toast } = useToast()
  const [following, setFollowing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabId>('products')

  const seller = MOCK_PROFILES.find((p) => p.username === username)
  if (!seller) notFound()

  const sellerProducts = MOCK_PRODUCTS.filter((p) => p.sellerId === seller.id)
  const sellerAuctions = MOCK_TRENDING_AUCTIONS.filter((a) => a.sellerId === seller.id)
  const activeAuctions = sellerAuctions.filter((a) => a.status === 'live')

  const handleFollow = () => {
    setFollowing((v) => !v)
    toast({
      title: following ? '👋 Dejaste de seguir' : '✅ Siguiendo',
      description: seller.displayName,
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

  const breadcrumbs = [
    { label: 'Vendedores', href: ROUTES.marketplace },
    { label: seller.displayName },
  ]

  const stats = [
    {
      label: 'Ventas',
      value: seller.salesCount.toLocaleString('es-PE'),
      icon: ShoppingBag,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Rating',
      value: `${seller.rating.toFixed(1)} ★`,
      icon: Star,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-400/10',
    },
    {
      label: 'Seguidores',
      value: seller.followerCount.toLocaleString('es-PE'),
      icon: Users,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      label: 'Subastas',
      value: sellerAuctions.length.toString(),
      icon: Trophy,
      color: 'text-lime-400',
      bg: 'bg-lime-400/10',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-16">
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

        {/* Profile header / hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative rounded-2xl overflow-hidden border border-white/5"
        >
          {/* Gradient banner background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-fuchsia-900/30 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,70,239,0.15),transparent_50%)]" />

          <div className="relative p-5 md:p-8 pt-6 md:pt-10">
            <div className="flex flex-col md:flex-row md:items-end gap-5">
              {/* Avatar with gradient ring */}
              <div className="relative shrink-0 -mb-2 md:mb-0">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 p-1 shadow-xl shadow-fuchsia-500/30">
                  <div className="h-full w-full rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                    {seller.avatarUrl ? (
                      <img
                        src={seller.avatarUrl}
                        alt={seller.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-white">
                        {initials(seller.displayName)}
                      </span>
                    )}
                  </div>
                </div>
                {seller.isVerified && (
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-sky-500 border-2 border-zinc-950 flex items-center justify-center">
                    <Verified className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Identity + actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black font-display text-white">
                    {seller.displayName}
                  </h1>
                  {seller.isLiveSeller && (
                    <StatusBadge variant="rose">
                      <Radio className="h-2.5 w-2.5" /> Live seller
                    </StatusBadge>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">@{seller.username}</p>
                {seller.bio && (
                  <p className="text-sm text-zinc-300 mt-2 max-w-lg leading-relaxed">{seller.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 flex-wrap">
                  {seller.department && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" /> {seller.department}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Vende desde 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">{seller.rating.toFixed(1)}</span>
                    <span className="text-zinc-500">({seller.ratingsCount})</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                <GradientButton
                  onClick={handleFollow}
                  className={`h-11 px-5 ${following ? '!from-zinc-700 !to-zinc-700 !text-zinc-300 !shadow-none' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Siguiendo' : 'Seguir'}
                </GradientButton>
                <Link href={`${ROUTES.mensajes}?u=${seller.username}`}>
                  <GhostButton className="h-11 px-4">
                    <MessageSquare className="h-4 w-4" /> Mensaje
                  </GhostButton>
                </Link>
                <GhostButton
                  onClick={handleShare}
                  className="h-11 w-11 !px-0 justify-center"
                  aria-label="Compartir"
                >
                  <Share2 className="h-4 w-4" />
                </GhostButton>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-3"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-white tabular-nums leading-tight truncate">
                        {stat.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex items-center gap-1 border-b border-white/10 mb-6 overflow-x-auto">
            {[
              { id: 'products' as TabId, label: `Productos (${sellerProducts.length})` },
              { id: 'auctions' as TabId, label: `Subastas activas (${activeAuctions.length})` },
              { id: 'reviews' as TabId, label: `Reseñas (${SELLER_REVIEWS.length})` },
              { id: 'about' as TabId, label: 'Sobre el vendedor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 md:px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="seller-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-amber-400 to-fuchsia-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Products tab */}
          {activeTab === 'products' &&
            (sellerProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                color="text-amber-400"
                title="Aún no hay productos publicados"
                description={`${seller.displayName} aún no ha subido productos al marketplace.`}
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {sellerProducts.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <Link
                      href={ROUTES.product(p.id)}
                      className="group block rounded-2xl bg-zinc-900/80 border border-white/5 overflow-hidden hover:border-amber-400/30 transition-colors h-full"
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
                      <div className="p-3">
                        <p className="text-xs font-medium text-white line-clamp-2 leading-tight min-h-[2rem]">
                          {p.title}
                        </p>
                        <p className="text-base font-black text-amber-400 mt-1.5 tabular-nums">
                          {formatPEN(p.basePrice)}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Stock: {p.stock} · {p.shippingFrom ?? 'Lima'}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ))}

          {/* Active auctions tab */}
          {activeTab === 'auctions' &&
            (sellerAuctions.length === 0 ? (
              <EmptyState
                icon={Trophy}
                color="text-lime-400"
                title="Aún no hay subastas"
                description={`${seller.displayName} no ha creado subastas todavía.`}
              />
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {sellerAuctions.map((a) => (
                  <motion.div key={a.id} variants={staggerItem}>
                    <Link
                      href={ROUTES.auction(a.id)}
                      className="group block rounded-2xl bg-zinc-900/80 border border-white/5 overflow-hidden hover:border-amber-400/30 transition-colors h-full"
                    >
                      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                        {a.product?.images[0] && (
                          <img
                            src={a.product.images[0]}
                            alt=""
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                        {a.status === 'live' ? (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/90 backdrop-blur-sm">
                            <Radio className="h-3 w-3 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">
                              En vivo
                            </span>
                          </div>
                        ) : (
                          <div className="absolute top-2 left-2">
                            <StatusBadge variant="amber">Programada</StatusBadge>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-[10px] text-zinc-400">Puja actual</p>
                          <p className="text-base font-black text-amber-400 tabular-nums leading-none">
                            {formatPEN(a.currentPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-white line-clamp-2 leading-tight min-h-[2rem]">
                          {a.product?.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                          <Trophy className="h-2.5 w-2.5" /> {a.bidCount} pujas · {a.watcherCount} observadores
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ))}

          {/* Reviews tab */}
          {activeTab === 'reviews' && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-fuchsia-500/10 border border-white/5 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-amber-400 tabular-nums leading-none">
                    {seller.rating.toFixed(1)}
                  </p>
                  <div className="flex items-center justify-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${
                          n <= Math.round(seller.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{seller.ratingsCount} calificaciones</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stars === 5 ? 75 : stars === 4 ? 18 : stars === 3 ? 5 : stars === 2 ? 1 : 1
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

              {/* Reviews list */}
              {SELLER_REVIEWS.map((r) => (
                <motion.div
                  key={r.id}
                  variants={staggerItem}
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
                      {r.productTitle && (
                        <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                          Sobre: <span className="text-amber-400">{r.productTitle}</span>
                        </p>
                      )}
                      <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* About tab */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {/* Bio card */}
              <div className="md:col-span-2 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6">
                <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" /> Sobre {seller.displayName}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {seller.bio ?? 'Vendedor verificado del marketplace Vende Ya Perú.'}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed mt-3">
                  Especialista en productos peruanos de calidad. Cada venta incluye boleta electrónica,
                  garantía de devolución y envíos a todo el país con las principales empresas de courier.
                  Pagos en Yape, Plin, PagoEfectivo y tarjetas.
                </p>

                <div className="mt-5 pt-5 border-t border-white/5 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-amber-400" /> Departamento
                    </span>
                    <span className="font-bold text-white">{seller.department ?? 'Lima'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" /> Miembro desde
                    </span>
                    <span className="font-bold text-white">2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-amber-400" /> Estado verificación
                    </span>
                    {seller.isVerified ? (
                      <span className="font-bold text-sky-300 flex items-center gap-1">
                        <Verified className="h-3.5 w-3.5" /> Verificado
                      </span>
                    ) : (
                      <span className="font-bold text-zinc-400">No verificado</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-amber-400" /> Vendedor en vivo
                    </span>
                    {seller.isLiveSeller ? (
                      <StatusBadge variant="lime">Sí</StatusBadge>
                    ) : (
                      <StatusBadge variant="zinc">No</StatusBadge>
                    )}
                  </div>
                </div>
              </div>

              {/* Side stats */}
              <div className="space-y-4">
                <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-3">
                    Rendimiento
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">Tasa de respuesta</span>
                        <span className="font-bold text-lime-400">98%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-lime-400 to-amber-400" style={{ width: '98%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">Envíos a tiempo</span>
                        <span className="font-bold text-sky-400">96%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-400 to-fuchsia-500" style={{ width: '96%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">Satisfacción</span>
                        <span className="font-bold text-amber-400">{seller.rating.toFixed(1)}/5</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-500"
                          style={{ width: `${(seller.rating / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5">
                  <h3 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-3">
                    Tiempo de envío
                  </h3>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="h-5 w-5" />
                    <span className="text-2xl font-black">1-2 días</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Promedio en Lima Metropolitana</p>
                </div>

                <Link href={`${ROUTES.mensajes}?u=${seller.username}`}>
                  <GhostButton className="w-full h-11">
                    <MessageSquare className="h-4 w-4" /> Contactar vendedor
                  </GhostButton>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  color,
  title,
  description,
}: {
  icon: React.ElementType
  color: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-12 text-center">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon className={`h-7 w-7 ${color}`} />
      </div>
      <p className="text-sm font-bold text-white mb-1">{title}</p>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  )
}
