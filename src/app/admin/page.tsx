import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingBag, Video, DollarSign, Activity, Ban, Skull } from 'lucide-react'
import { banUser, unbanUser, killStream } from './actions'

const SUPER_ADMIN_EMAIL = 'profastpage@gmail.com'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/')
  }

  // Fetch real statistics from Prisma
  let stats = {
    users: 0, products: 0, liveStreams: 0, orders: 0,
    totalRevenue: 0, platformCommissions: 0,
    marketplaceRevenue: 0, auctionRevenue: 0
  }

  let usersList: any[] = []
  let activeStreamsList: any[] = []

  try {
    const [usersCount, productsCount, streamsCount, ordersCount] = await Promise.all([
      db.profile.count(), db.product.count(), db.liveStream.count(), db.order.count()
    ])

    const allOrders = await db.order.findMany({
      select: { totalAmount: true, platformCommissionAmount: true, source: true }
    })

    const totalRev = allOrders.reduce((acc, o) => acc + o.totalAmount, 0)
    const commRev = allOrders.reduce((acc, o) => acc + o.platformCommissionAmount, 0)
    const mpRev = allOrders.filter(o => o.source === 'marketplace').reduce((acc, o) => acc + o.platformCommissionAmount, 0)
    const auctionRev = allOrders.filter(o => o.source === 'live_stream').reduce((acc, o) => acc + o.platformCommissionAmount, 0)

    stats = {
      users: usersCount, products: productsCount, liveStreams: streamsCount, orders: ordersCount,
      totalRevenue: totalRev, platformCommissions: commRev,
      marketplaceRevenue: mpRev, auctionRevenue: auctionRev
    }

    usersList = await db.profile.findMany({ take: 20, orderBy: { createdAt: 'desc' } })
    activeStreamsList = await db.liveStream.findMany({ 
      where: { isLive: true },
      include: { seller: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-black text-[#FE2C55] flex items-center gap-3">
            👑 PANEL MODO DIOS
          </h1>
          <p className="text-zinc-400 mt-2">Control total y absoluto sobre Vende Ya.</p>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Ganancias (Comisiones)</CardTitle>
              <DollarSign className="w-4 h-4 text-[#FE2C55]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">S/ {stats.platformCommissions.toFixed(2)}</div>
              <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                <span>Subastas: S/ {stats.auctionRevenue.toFixed(2)}</span>
                <span>Marketplace: S/ {stats.marketplaceRevenue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Volumen Procesado (Bruto)</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">S/ {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-zinc-500 mt-1">En {stats.orders} pedidos</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Vendedores & Usuarios</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.users}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Transmisiones Históricas</CardTitle>
              <Video className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.liveStreams}</div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVE STREAMS TO KILL */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-2 text-white">🔴 Transmisiones En Vivo (Botón del Pánico)</h2>
          {activeStreamsList.length === 0 ? (
            <p className="text-zinc-500">No hay nadie transmitiendo en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeStreamsList.map(stream => (
                <div key={stream.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white">{stream.title}</h3>
                    <p className="text-xs text-zinc-400">Vendedor: {stream.seller?.displayName || 'Desconocido'}</p>
                    <p className="text-xs text-zinc-400">Kick: {stream.kickUsername || 'N/A'}</p>
                  </div>
                  <form action={async () => {
                    'use server';
                    await killStream(stream.id);
                  }}>
                    <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                      <Skull className="w-4 h-4" /> Matar Stream
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* USERS TO BAN */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-2 text-white">🔨 Gestión de Vendedores (Banear)</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email/ID</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {usersList.map((u: any) => (
                  <tr key={u.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                    <td className="px-4 py-3 text-zinc-500">{u.username}</td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">BANEADO</span>
                      ) : (
                        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">ACTIVO</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.username === 'profastpage' || u.id === 'system-demo-1' ? (
                        <span className="text-xs text-zinc-600">INMORTAL</span>
                      ) : (
                        <form action={async () => {
                          'use server';
                          if (u.isBanned) await unbanUser(u.id);
                          else await banUser(u.id);
                        }}>
                          <button type="submit" className={`font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 ml-auto ${u.isBanned ? 'bg-zinc-700 text-white' : 'bg-red-900/50 text-red-500 hover:bg-red-600 hover:text-white'}`}>
                            <Ban className="w-3.5 h-3.5" />
                            {u.isBanned ? 'Desbanear' : 'Banear'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}