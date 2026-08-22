import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingBag, Video, DollarSign, Activity } from 'lucide-react'

// Super Admin Email
const SUPER_ADMIN_EMAIL = 'profastpage@gmail.com'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/')
  }

  // Fetch real statistics from Prisma
  let stats = {
    users: 0,
    products: 0,
    liveStreams: 0,
    orders: 0,
    totalRevenue: 0
  }

  let recentUsers: any[] = []

  try {
    const [usersCount, productsCount, streamsCount, ordersCount, revenueResult, users] = await Promise.all([
      db.profile.count(),
      db.product.count(),
      db.liveStream.count(),
      db.order.count(),
      db.order.aggregate({
        _sum: { totalAmount: true }
      }),
      db.profile.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ])

    stats = {
      users: usersCount,
      products: productsCount,
      liveStreams: streamsCount,
      orders: ordersCount,
      totalRevenue: revenueResult._sum.totalAmount || 0
    }
    recentUsers = users

  } catch (dbError) {
    console.error("Error fetching admin stats:", dbError)
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pt-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-[#FE2C55]" /> Panel de Control Ultimate
        </h1>
        <p className="text-muted-foreground">Bienvenido, Super Administrador. Visión global del ecosistema Vende Ya.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">Perfiles activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Listados</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">En el marketplace</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.orders} órdenes procesadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Streams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liveStreams}</div>
            <p className="text-xs text-muted-foreground">Transmisiones históricas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Últimos Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold">
                    {user.displayName[0]}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay usuarios recientes.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Infraestructura & Costos</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold text-sm mb-1">ImageKit (Marketplace)</h4>
                  <p className="text-xs text-muted-foreground mb-2">Límite mensual: 20GB gratis</p>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 w-[5%] h-full"></div>
                  </div>
               </div>
               
               <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="font-semibold text-sm mb-1">Bunny.net (Live Streams)</h4>
                  <p className="text-xs text-muted-foreground mb-2">Volumen Estimado (Video HLS)</p>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 w-[15%] h-full"></div>
                  </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
