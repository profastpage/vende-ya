'use client'

import * as React from 'react'
import Link from 'next/link'
import { Edit, Heart, ShoppingBag, Star, Trophy, Verified, Settings, LogOut } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MOCK_PROFILES, MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatPEN, initials } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'

const breadcrumbs: Breadcrumb[] = [{ label: 'Mi perfil' }]

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

  return (
    <AppShell title="Mi perfil" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      <Card className="overflow-hidden mb-4">
        <div className="h-24 bg-gradient-to-br from-salsa-500 to-salsa-700" />
        <div className="p-6 pt-0">
          <div className="flex items-end gap-4 -mt-10">
            <Avatar className="h-20 w-20 border-4 border-card shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
              <AvatarFallback className="text-2xl">{initials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{user.displayName}</h1>
                {user.isVerified && <Verified className="h-4 w-4 text-salsa-500" />}
              </div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <Link href={ROUTES.configuracion}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" /> Editar
              </Button>
            </Link>
          </div>

          {user.bio && <p className="text-sm mt-3">{user.bio}</p>}

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
            <Stat label="Ventas" value={user.salesCount.toString()} icon={ShoppingBag} />
            <Stat label="Reseñas" value={user.ratingsCount.toString()} icon={Star} />
            <Stat label="Rating" value={`${user.rating.toFixed(1)}★`} icon={Trophy} />
            <Stat label="Favoritos" value="12" icon={Heart} />
          </div>
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Mis productos</h3>
        {myProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no vendes nada. ¡Publica tu primer producto!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {myProducts.map((p) => (
              <Link key={p.id} href={ROUTES.product(p.id)}>
                <Card className="overflow-hidden hover:shadow-soft transition-shadow">
                  <div className="aspect-square bg-muted">
                    {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-1">{p.title}</p>
                    <p className="text-sm font-bold text-salsa-600">{formatPEN(p.basePrice)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <Link href={ROUTES.vender}>
          <Button className="w-full mt-3 bg-salsa-500 hover:bg-salsa-600 text-white">
            <ShoppingBag className="h-4 w-4 mr-2" /> Vender algo nuevo
          </Button>
        </Link>
      </Card>

      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3">Subastas ganadas</h3>
        {wonAuctions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no ganaste subastas.</p>
        ) : (
          <div className="space-y-2">
            {wonAuctions.map((a) => (
              <Link key={a.id} href={ROUTES.auction(a.id)}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                    {a.product?.images[0] && <img src={a.product.images[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.product?.title}</p>
                    <p className="text-xs text-muted-foreground">Ganaste con {formatPEN(a.currentPrice)}</p>
                  </div>
                  <Badge className="bg-lima-500 text-white">Ganado</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-1">
        <Link href={ROUTES.configuracion} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">Configuración</span>
        </Link>
        <Link href={ROUTES.pagos} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">Métodos de pago</span>
        </Link>
        <Link href={ROUTES.envios} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">Direcciones de envío</span>
        </Link>
        <button
          onClick={async () => {
            await signOut()
            window.location.href = ROUTES.login
          }}
          className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted/50 text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm flex-1 text-left">Cerrar sesión</span>
        </button>
      </Card>
    </AppShell>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
      <div className="text-sm font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}
