'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Gavel, Tag, MessageSquare, Heart, Settings,
  TrendingUp, Wallet, Bell, ShoppingBag, ArrowUpRight, Trophy,
  AlertTriangle, Package, ShieldAlert, Loader2, Truck,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { PushSubscribeButton } from '@/components/vendeda/PWA'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPEN, timeAgoEs, initials } from '@/lib/vendeda/format'
import { MOCK_PROFILES, MOCK_TRENDING_AUCTIONS, MOCK_PRODUCTS } from '@/lib/vendeda/mock-data'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'

const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard' }]

const TABS = [
  { id: 'overview',       label: 'Resumen',      icon: LayoutDashboard },
  { id: 'bids',           label: 'Mis pujas',    icon: Gavel },
  { id: 'sales',          label: 'Ventas',       icon: Tag },
  { id: 'messages',       label: 'Mensajes',     icon: MessageSquare },
  { id: 'favorites',      label: 'Favoritos',    icon: Heart },
  { id: 'settings',       label: 'Ajustes',      icon: Settings },
] as const

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user: authUser } = useAuth()
  // Use auth user if available, else fall back to mock for demo mode
  const user = authUser
    ? {
        ...MOCK_PROFILES[5],
        id: authUser.id,
        displayName: authUser.displayName,
        avatarUrl: authUser.avatarUrl ?? MOCK_PROFILES[5].avatarUrl,
        bio: authUser.isDemo ? MOCK_PROFILES[5].bio : (MOCK_PROFILES[5].bio ?? null),
      }
    : MOCK_PROFILES[5]

  return (
    <AppShell
      title="Mi Dashboard"
      breadcrumbs={breadcrumbs}
      showBack
      maxWidth="max-w-6xl"
    >
      {/* Profile header */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-salsa-500 to-salsa-700 text-white border-0 shadow-glow-salsa">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/30 shrink-0">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
            <AvatarFallback className="text-2xl">{initials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display truncate">{user.displayName}</h2>
              <Badge className="bg-white/20 text-white border-0">@{user.username}</Badge>
            </div>
            <p className="text-white/80 text-sm mt-1">{user.bio}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span><strong>{user.followerCount}</strong> seguidores</span>
              <span><strong>{user.salesCount}</strong> ventas</span>
              <span>⭐ <strong>{user.rating.toFixed(1)}</strong></span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={ROUTES.vender}>
              <Button className="bg-white text-salsa-700 hover:bg-white/90 w-full">
                <Tag className="h-4 w-4 mr-2" /> Vender algo
              </Button>
            </Link>
            <Link href={ROUTES.perfil}>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full">
                Ver perfil público
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Trophy} label="Subastas ganadas" value="3" trend="+2 este mes" color="text-lima-500" />
        <StatCard icon={Gavel} label="Pujas activas" value="2" trend="1 ganando" color="text-salsa-500" />
        <StatCard icon={Wallet} label="Total gastado" value="S/. 480" trend="Últimos 30 días" color="text-plin-500" />
        <StatCard icon={TrendingUp} label="Rating dado" value="4.8 ★" trend="12 reseñas" color="text-salsa-500" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1 py-2 text-xs"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-salsa-500" /> Actividad reciente
            </h3>
            <div className="space-y-3">
              {[
                { icon: Trophy, color: 'text-lima-500', title: '🎉 Ganaste la subasta', desc: 'Polo algodón pima — S/. 38.00', time: 'hace 2 horas' },
                { icon: Gavel, color: 'text-salsa-500', title: 'Nueva puja en tu subasta', desc: 'Vestido artesanal — S/. 120', time: 'hace 5 horas' },
                { icon: MessageSquare, color: 'text-plin-500', title: 'Nuevo mensaje de Rosa', desc: '"¿Te interesa otro talla?"', time: 'ayer' },
                { icon: Heart, color: 'text-salsa-500', title: 'Tu producto favorito bajó de precio', desc: 'Samsung Galaxy A55 — S/. 1250', time: 'hace 2 días' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <item.icon className={cn('h-5 w-5 shrink-0 mt-0.5', item.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gavel className="h-4 w-4 text-salsa-500" /> Próximas subastas
              </h3>
              <div className="space-y-2">
                {MOCK_TRENDING_AUCTIONS.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={ROUTES.auction(a.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                      {a.product?.images[0] && (
                        <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.product?.title}</p>
                      <p className="text-xs text-muted-foreground">Termina en 2:45</p>
                    </div>
                    <span className="text-sm font-bold text-salsa-600">{formatPEN(a.currentPrice)}</span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-lima-500" /> Acciones rápidas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href={ROUTES.vender}>
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
                    <Tag className="h-5 w-5 text-salsa-500" />
                    <span className="text-xs">Vender producto</span>
                  </Button>
                </Link>
                <Link href={ROUTES.live}>
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
                    <Gavel className="h-5 w-5 text-salsa-500" />
                    <span className="text-xs">Ver en vivo</span>
                  </Button>
                </Link>
                <Link href={ROUTES.mensajes}>
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
                    <MessageSquare className="h-5 w-5 text-plin-500" />
                    <span className="text-xs">Mensajes</span>
                  </Button>
                </Link>
                <Link href={ROUTES.pagos}>
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-1">
                    <Wallet className="h-5 w-5 text-lima-500" />
                    <span className="text-xs">Pagos</span>
                  </Button>
                </Link>
              </div>

              {/* Push notification opt-in */}
              <div className="mt-4 pt-4 border-t">
                <PushSubscribeButton className="w-full" />
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bids">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Mis pujas activas</h3>
            <div className="space-y-2">
              {MOCK_TRENDING_AUCTIONS.map((a) => (
                <Link
                  key={a.id}
                  href={ROUTES.auction(a.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                    {a.product?.images[0] && (
                      <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.product?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Puja actual: <span className="font-semibold text-foreground">{formatPEN(a.currentPrice)}</span>
                      {' · '}{a.bidCount} pujas
                    </p>
                  </div>
                  <Badge className={cn(
                    a.status === 'live' ? 'bg-salsa-100 text-salsa-700' : 'bg-lima-100 text-lima-700'
                  )}>
                    {a.status === 'live' ? 'EN VIVO' : 'Ganando'}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <SalesPanel sellerId={user.id} />
        </TabsContent>

        <TabsContent value="messages">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mensajes recientes</h3>
              <Link href={ROUTES.mensajes}>
                <Button variant="ghost" size="sm" className="text-salsa-600">
                  Ver todos <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {MOCK_PROFILES.slice(0, 3).map((p, i) => (
                <Link
                  key={p.id}
                  href={`${ROUTES.mensajes}?u=${p.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p.avatarUrl ?? undefined} alt={p.displayName} />
                    <AvatarFallback>{initials(p.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {['Hola, ¿aún tienes el polo?', 'Te transfiero el Yape ahora 🙌', '¿Envías a Arequipa?'][i]}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgoEs(new Date(Date.now() - i * 3600_000))}</span>
                </Link>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Favoritos guardados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOCK_PRODUCTS.slice(0, 4).map((p) => (
                <Link key={p.id} href={ROUTES.product(p.id)}>
                  <Card className="overflow-hidden hover:shadow-soft transition-shadow">
                    <div className="aspect-square bg-muted">
                      {p.images[0] && (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium line-clamp-1">{p.title}</p>
                      <p className="text-sm font-bold text-salsa-600">{formatPEN(p.basePrice)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold mb-2">Ajustes de cuenta</h3>
            {[
              { label: 'Información personal', href: ROUTES.configuracion, icon: Settings },
              { label: 'Métodos de pago', href: ROUTES.pagos, icon: Wallet },
              { label: 'Direcciones de envío', href: ROUTES.envios, icon: ShoppingBag },
              { label: 'Notificaciones', href: ROUTES.notificaciones, icon: Bell },
              { label: 'Privacidad y seguridad', href: ROUTES.privacidad, icon: Settings },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

function StatCard({
  icon: Icon, label, value, trend, color,
}: {
  icon: React.ElementType
  label: string
  value: string
  trend: string
  color: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div className="text-2xl font-bold mt-2 tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{trend}</div>
    </Card>
  )
}

// ----------------------------------------------------------------------
// SalesPanel — consume /api/seller/dashboard y muestra:
//   - Wallet status (KYC, gateway seller id, estado de cuenta)
//   - Resumen financiero (ventas, comisiones, neto, escrow pendiente)
//   - Últimas órdenes con desglose completo del split Modo A
//   - Envíos Shalom pendientes de dropoff (con acción "Imprimir guía")
//   - Alertas de moderación (KYC faltante, suspended, banned, reports)
//   - Reportes de copyright contra el vendedor (si los hay)
// ----------------------------------------------------------------------
interface SellerDashboardData {
  wallet: {
    id: string;
    gatewaySellerId: string;
    isVerified: boolean;
    status: string;
  };
  summary: {
    totalSales: number;
    totalCommissions: number;
    totalGatewayFees: number;
    totalNet: number;
    pendingEscrow: number;
  };
  recentOrders: Array<{
    id: string;
    buyerId: string;
    source: string;
    totalAmount: number;
    platformCommissionAmount: number;
    gatewayFeeAmount: number;
    sellerNetAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    gatewayTransactionId: string | null;
    createdAt: string;
    shipment?: {
      trackingCode: string | null;
      shipmentStatus: string;
      pdfLabelUrl: string | null;
    } | null;
  }>;
  pendingDropoffs: Array<{
    order: { id: string; totalAmount: number; buyerId: string };
    shipment: { trackingCode: string | null; pdfLabelUrl: string | null };
  }>;
  copyrightReports: Array<{
    id: string;
    reporterEmail: string;
    infringedBrand: string;
    status: string;
    createdAt: string;
  }>;
  alerts: Array<{ level: 'info' | 'warning' | 'critical'; message: string }>;
}

function SalesPanel({ sellerId }: { sellerId: string }) {
  const { user } = useAuth()
  // Demo sellerId fallback cuando no hay auth real configurado
  const effectiveSellerId = user?.id ?? sellerId ?? 'demo-seller'

  const { data, isLoading, error } = useSellerDashboard(effectiveSellerId)

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          No se pudo cargar el panel de ventas. {error ?? 'Intenta más tarde.'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Esto es normal si tu wallet aún no está registrada en Vende Ya.
        </p>
      </Card>
    )
  }

  const { wallet, summary, recentOrders, pendingDropoffs, copyrightReports, alerts } = data

  return (
    <div className="space-y-4">
      {/* Alertas de moderación */}
      {alerts.length > 0 && (
        <Card className="p-4 space-y-2 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" /> Alertas de moderación
          </div>
          {alerts.map((a, i) => (
            <div
              key={i}
              className={cn(
                'text-xs px-3 py-2 rounded-md',
                a.level === 'critical'
                  ? 'bg-rose-100 text-rose-800'
                  : a.level === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
              )}
            >
              {a.message}
            </div>
          ))}
        </Card>
      )}

      {/* Wallet card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-lima-500" /> Mi Billetera
          </h3>
          <Link href={ROUTES.pagos}>
            <Button size="sm" variant="outline">
              <Wallet className="h-3 w-3 mr-1" /> Configurar
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="font-semibold capitalize">{wallet.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verificación KYC</p>
            <p className={cn(
              'font-semibold',
              wallet.isVerified ? 'text-lima-600' : 'text-rose-600'
            )}>
              {wallet.isVerified ? '✓ Verificada' : '✗ Pendiente'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Gateway Seller ID</p>
            <p className="font-mono text-xs break-all">{wallet.gatewaySellerId}</p>
          </div>
        </div>
      </Card>

      {/* Resumen financiero */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-salsa-500" /> Resumen financiero
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Trophy}
            label="Ventas totales"
            value={formatPEN(summary.totalSales)}
            trend="Últimas 20 órdenes"
            color="text-salsa-500"
          />
          <StatCard
            icon={Tag}
            label="Comisiones Vende Ya"
            value={formatPEN(summary.totalCommissions)}
            trend="12% en vivo / 8% mkt"
            color="text-amber-500"
          />
          <StatCard
            icon={Wallet}
            label="Costos pasarela"
            value={formatPEN(summary.totalGatewayFees)}
            trend="3.9% + IGV"
            color="text-rose-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Tu neto"
            value={formatPEN(summary.totalNet)}
            trend={`Escrow: ${formatPEN(summary.pendingEscrow)}`}
            color="text-lima-500"
          />
        </div>
      </Card>

      {/* Envíos pendientes de dropoff */}
      {pendingDropoffs.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-salsa-500" /> Envíos Shalom pendientes
            <Badge variant="secondary">{pendingDropoffs.length}</Badge>
          </h3>
          <div className="space-y-2">
            {pendingDropoffs.map(({ order, shipment }) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 border-amber-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Orden {order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPEN(order.totalAmount)} · Tracking:{' '}
                    <span className="font-mono">{shipment.trackingCode ?? 'Pendiente'}</span>
                  </p>
                </div>
                {shipment.pdfLabelUrl && (
                  <a
                    href={shipment.pdfLabelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      <Package className="h-3 w-3 mr-1" /> Imprimir guía
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reportes de copyright */}
      {copyrightReports.length > 0 && (
        <Card className="p-6 border-rose-200 bg-rose-50">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-rose-900">
            <ShieldAlert className="h-4 w-4 text-rose-500" /> Reportes de PI contra ti
            <Badge variant="destructive">{copyrightReports.length}</Badge>
          </h3>
          <div className="space-y-2">
            {copyrightReports.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-white border border-rose-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Marca: {r.infringedBrand}</p>
                  <Badge
                    variant={
                      r.status === 'pending' ? 'destructive' :
                      r.status === 'resolved_ban' ? 'destructive' :
                      r.status === 'investigating' ? 'secondary' : 'outline'
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reportado por {r.reporterEmail} · {timeAgoEs(new Date(r.createdAt))}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-rose-700 mt-3">
            Si crees que es un error, contacta a{' '}
            <a
              href="mailto:legal@vendeya.pe"
              className="underline font-semibold"
            >
              legal@vendeya.pe
            </a>{' '}
            para apelar.
          </p>
        </Card>
      )}

      {/* Últimas órdenes */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-lima-500" /> Últimas órdenes
        </h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Aún no tienes ventas. ¡Publica tu primer producto!
          </p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">#{o.id.slice(0, 8)}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {o.source === 'live_stream' ? '🎥 En vivo' : '🛒 Marketplace'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {timeAgoEs(new Date(o.createdAt))}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-semibold">{formatPEN(o.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Comisión</div>
                    <div className="text-rose-600 font-semibold">
                      -{formatPEN(o.platformCommissionAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Pasarela</div>
                    <div className="text-rose-600 font-semibold">
                      -{formatPEN(o.gatewayFeeAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Neto</div>
                    <div className="text-lima-600 font-semibold">
                      {formatPEN(o.sellerNetAmount)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <Badge
                    variant={
                      o.paymentStatus === 'released' ? 'default' :
                      o.paymentStatus === 'escrow_hold' ? 'secondary' :
                      o.paymentStatus === 'paid' ? 'secondary' :
                      o.paymentStatus === 'refunded' ? 'destructive' : 'outline'
                    }
                    className="text-[10px] capitalize"
                  >
                    {o.paymentStatus.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {o.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

/**
 * Hook para consumir /api/seller/dashboard con polling cada 30s.
 * Si la wallet no existe, devuelve error (manejado por el UI).
 */
function useSellerDashboard(sellerId: string) {
  const [data, setData] = React.useState<SellerDashboardData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/seller/dashboard?sellerId=${encodeURIComponent(sellerId)}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const json = await res.json()
        if (active) {
          setData(json)
          setError(null)
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Error desconocido')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [sellerId])

  return { data, error, isLoading }
}
