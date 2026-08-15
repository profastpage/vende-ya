'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Edit, Heart, ShoppingBag, Star, Trophy, Verified, Settings, LogOut,
  ArrowLeft, ChevronRight, Bell, Lock, User as UserIcon, CreditCard,
  Truck, Shield, MessageSquare, ThumbsUp, Package, Gavel, Share2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MOCK_PROFILES, MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatPEN, initials, timeAgoEs } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'

const PAGE_TITLE = 'Mi perfil'

interface Review {
  id: string
  author: string
  avatar: string
  rating: number
  comment: string
  date: string
  productTitle: string
}

// Mock reviews shown in the Reseñas tab.
const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'María Quispe',
    avatar: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    comment: 'Excelente vendedora, me llegó el polo en 2 días y la talla era perfecta. súper recomendada, volveré a comprar.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    productTitle: 'Polo algodón pima — edición Lima',
  },
  {
    id: 'r2',
    author: 'Diego Flores',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment: 'Compré un Samsung A55 en subasta en vivo y me ahorre S/ 200 frente al mercado. Producto 100% original con boleta.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    productTitle: 'Samsung Galaxy A55 5G 256GB',
  },
  {
    id: 'r3',
    author: 'Carla Ramos',
    avatar: 'https://i.pravatar.cc/150?img=23',
    rating: 4,
    comment: 'El producto llegó en buen estado pero el envío tardó un poco más de lo prometido. Por lo demás, todo OK.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    productTitle: 'Set skincare natural — sacha inchik + aguaje',
  },
]

interface SettingsItem {
  icon: React.ElementType
  label: string
  desc: string
  href: string
  color: string
}

const SETTINGS_GROUPS: {
  title: string
  items: SettingsItem[]
}[] = [
  {
    title: 'Cuenta',
    items: [
      { icon: UserIcon, label: 'Datos personales', desc: 'Nombre, foto, email, celular', href: ROUTES.configuracion, color: 'text-amber-400' },
      { icon: CreditCard, label: 'Métodos de pago', desc: 'Mercado Pago, Yape, Plin, tarjetas', href: ROUTES.pagos, color: 'text-lime-400' },
      { icon: Truck, label: 'Direcciones de envío', desc: 'Olva, Shalom, Marvisur, recojo en tienda', href: ROUTES.envios, color: 'text-fuchsia-400' },
    ],
  },
  {
    title: 'Preferencias',
    items: [
      { icon: Bell, label: 'Notificaciones', desc: 'Push, email, SMS — pujas, ventas, mensajes', href: ROUTES.configuracion, color: 'text-sky-400' },
      { icon: Lock, label: 'Privacidad y seguridad', desc: 'Sesiones activas, 2FA, datos personales', href: ROUTES.privacidad, color: 'text-purple-400' },
      { icon: Shield, label: 'Verificación de identidad', desc: 'DNI, KYC, cuenta verificada', href: ROUTES.configuracion, color: 'text-rose-400' },
    ],
  },
]

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}

function ProfileContent() {
  const { user: authUser, signOut } = useAuth()
  const user = authUser
    ? {
        ...MOCK_PROFILES[5],
        id: authUser.id,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl ?? MOCK_PROFILES[5].avatarUrl,
      }
    : MOCK_PROFILES[5]
  const myProducts = MOCK_PRODUCTS.slice(0, 2)
  const wonAuctions = MOCK_TRENDING_AUCTIONS.slice(0, 1)

  const stats = [
    { label: 'Ventas', value: user.salesCount.toString(), icon: ShoppingBag, color: 'text-amber-400', bg: 'from-amber-400/15 to-amber-500/5' },
    { label: 'Seguidores', value: user.followerCount.toLocaleString('es-PE'), icon: Heart, color: 'text-fuchsia-400', bg: 'from-fuchsia-400/15 to-fuchsia-500/5' },
    { label: 'Rating', value: user.ratingsCount > 0 ? `${user.rating.toFixed(1)}★` : '—', icon: Trophy, color: 'text-lime-400', bg: 'from-lime-400/15 to-lime-500/5' },
    { label: 'Subastas', value: wonAuctions.length.toString(), icon: Gavel, color: 'text-rose-400', bg: 'from-rose-400/15 to-rose-500/5' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 md:pb-12">
      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href={ROUTES.dashboard} aria-label="Volver" className="p-2 -ml-2 text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold font-display truncate text-white">{PAGE_TITLE}</h1>
            <p className="text-[10px] text-zinc-500 truncate">@{user.username}</p>
          </div>
        </div>
      </header>

      {/* Desktop breadcrumb */}
      <div className="hidden md:block border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-1 text-sm text-zinc-500">
          <Link href={ROUTES.home} className="hover:text-zinc-200">Inicio</Link>
          <ChevronRight className="h-3 w-3 mx-1" />
          <span className="text-white font-medium">{PAGE_TITLE}</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* ─── Profile header with gradient banner ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm"
        >
          {/* Gradient banner */}
          <div className="h-32 md:h-40 bg-gradient-to-br from-amber-500/20 via-fuchsia-900/30 to-zinc-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.15),transparent_60%)]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />
          </div>

          {/* Profile body */}
          <div className="px-6 md:px-8 pb-6 md:pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-14">
              {/* Avatar with gradient ring */}
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-600 blur-sm opacity-80" />
                <Avatar className="relative h-24 w-24 md:h-28 md:w-28 border-4 border-zinc-950 ring-1 ring-white/10">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-zinc-900 text-white">
                    {initials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <div className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-sky-500 border-3 border-zinc-950 flex items-center justify-center">
                    <Verified className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Name + username */}
              <div className="flex-1 min-w-0 pt-2 md:pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black font-display text-white">
                    {user.displayName}
                  </h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-sky-500/15 text-sky-300 border-sky-500/30">
                      <Verified className="h-3 w-3" /> Verificado
                    </span>
                  )}
                  {authUser?.isDemo && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-amber-400/15 text-amber-300 border-amber-400/30">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">@{user.username}</p>
                {user.department && (
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                    {user.department}, Perú
                  </p>
                )}
              </div>

              {/* Edit button */}
              <Link href={ROUTES.configuracion} className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-1.5"
                >
                  <Edit className="h-4 w-4" /> Editar perfil
                </Button>
              </Link>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-zinc-300 mt-4 leading-relaxed max-w-2xl">{user.bio}</p>
            )}

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {user.isLiveSeller && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-rose-500/10 text-rose-300 border-rose-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  Vendedora en vivo
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white/5 text-zinc-300 border-white/10">
                <MessageSquare className="h-3 w-3" />
                {user.ratingsCount} reseñas
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-white/5 text-zinc-300 border-white/10">
                <ThumbsUp className="h-3 w-3" />
                98% positivas
              </span>
            </div>

            {/* Stats row — 4 KPIs in bento mini cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.05 * i }}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border border-white/5 p-4',
                    'bg-gradient-to-br',
                    s.bg
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <s.icon className={cn('h-4 w-4', s.color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono text-white tabular-nums">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── Tabs ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Tabs defaultValue="productos" className="space-y-4">
            <TabsList className="bg-zinc-900/80 border border-white/5 p-1 h-auto rounded-2xl flex-wrap">
              <TabsTrigger
                value="productos"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-amber-300 text-zinc-400 px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Package className="h-4 w-4 mr-1.5" /> Mis productos
              </TabsTrigger>
              <TabsTrigger
                value="subastas"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-amber-300 text-zinc-400 px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Gavel className="h-4 w-4 mr-1.5" /> Subastas
              </TabsTrigger>
              <TabsTrigger
                value="reseñas"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-amber-300 text-zinc-400 px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Star className="h-4 w-4 mr-1.5" /> Reseñas
              </TabsTrigger>
              <TabsTrigger
                value="config"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-amber-300 text-zinc-400 px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Settings className="h-4 w-4 mr-1.5" /> Configuración
              </TabsTrigger>
            </TabsList>

            {/* ── Mis productos ── */}
            <TabsContent value="productos">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">Mis productos publicados</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Gestiona tu inventario activo. Edita precios, fotos o desactiva productos que ya no quieras vender.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-zinc-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                    {myProducts.length} activos
                  </span>
                </div>

                {myProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-400 mb-4">Aún no vendes nada. ¡Publica tu primer producto!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {myProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={ROUTES.product(p.id)}
                        className="group rounded-xl border border-white/5 bg-zinc-950/50 overflow-hidden hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all"
                      >
                        <div className="aspect-square bg-white/5 overflow-hidden">
                          {p.images[0] && (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-white line-clamp-1 mb-1">{p.title}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-amber-300 font-mono">{formatPEN(p.basePrice)}</p>
                            <span className="text-[10px] text-zinc-500">Stock: {p.stock}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <Link href={ROUTES.vender}>
                  <Button className="w-full mt-4 h-11 bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold border-0 shadow-lg shadow-fuchsia-500/30">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Vender algo nuevo
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* ── Subastas ── */}
            <TabsContent value="subastas">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-white">Subastas ganadas</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Historial de subastas en vivo que has ganado. Las pujas se cobran automáticamente al finalizar el cronómetro.
                  </p>
                </div>

                {wonAuctions.length === 0 ? (
                  <div className="text-center py-12">
                    <Gavel className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-400">Aún no ganaste subastas. ¡Encuentra tu primera puja en la home!</p>
                    <Link href={ROUTES.live}>
                      <Button variant="outline" className="mt-4 bg-white/5 border-white/10 text-white hover:bg-white/10">
                        Ver en vivo ahora <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wonAuctions.map((a) => (
                      <Link
                        key={a.id}
                        href={ROUTES.auction(a.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 hover:bg-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {a.product?.images[0] && (
                            <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{a.product?.title}</p>
                          <p className="text-xs text-zinc-400">
                            Ganaste con <span className="font-mono text-lime-300 font-semibold">{formatPEN(a.currentPrice)}</span>
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border bg-lime-400/15 text-lime-300 border-lime-400/30 shrink-0">
                          <Trophy className="h-3 w-3" /> Ganado
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Reseñas ── */}
            <TabsContent value="reseñas">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">Reseñas de compradores</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Calificaciones y comentarios reales de compradores verificados.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-amber-300">
                      {user.ratingsCount > 0 ? user.rating.toFixed(1) : '—'}
                      {user.ratingsCount > 0 && <span className="text-sm">★</span>}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {user.ratingsCount} calificaciones
                    </div>
                  </div>
                </div>

                {MOCK_REVIEWS.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-400">Aún no tienes reseñas. ¡Vende tu primer producto!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {MOCK_REVIEWS.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-white/5 bg-zinc-950/50"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9 ring-1 ring-white/10 shrink-0">
                            <AvatarImage src={r.avatar} alt={r.author} />
                            <AvatarFallback className="text-xs bg-zinc-900 text-white">
                              {initials(r.author)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-white">{r.author}</p>
                              <p className="text-xs text-zinc-500">{timeAgoEs(r.date)}</p>
                            </div>
                            <div className="flex items-center gap-1 mb-1.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-3 w-3',
                                    i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed mb-2">{r.comment}</p>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <Package className="h-3 w-3" /> {r.productTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Configuración ── */}
            <TabsContent value="config">
              <div className="space-y-4">
                {SETTINGS_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm p-5"
                  >
                    <h3 className="font-bold text-white mb-3">{group.title}</h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <item.icon className={cn('h-4 w-4', item.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{item.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Sign out + share profile */}
                <div className="rounded-2xl border border-white/5 bg-zinc-900/80 backdrop-blur-sm p-5 space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                    <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Share2 className="h-4 w-4 text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Compartir mi perfil</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Copia el enlace y compártelo en WhatsApp o Instagram</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />
                  </button>
                  <button
                    onClick={async () => {
                      await signOut()
                      window.location.href = ROUTES.login
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 transition-colors text-left group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <LogOut className="h-4 w-4 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-rose-300">Cerrar sesión</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Sale de tu cuenta en este dispositivo</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-rose-300 transition-colors shrink-0" />
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.section>
      </main>
    </div>
  )
}
