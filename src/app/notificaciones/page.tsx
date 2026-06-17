'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Gavel, Trophy, Heart, MessageSquare, Bell, User, Radio, Check,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatPEN, timeAgoEs } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'

const breadcrumbs: Breadcrumb[] = [{ label: 'Notificaciones' }]

const NOTIFICATIONS = [
  { id: 'n1', type: 'auction-won',     icon: Trophy,        color: 'text-lima-500',  title: '🎉 Ganaste la subasta', body: 'Polo algodón pima por S/. 38.00', time: Date.now() - 2 * 3600_000, link: '/subastas/a1' },
  { id: 'n2', type: 'bid-outbid',      icon: Gavel,         color: 'text-salsa-500', title: 'Te superaron', body: 'Nueva puja de S/. 980 en Samsung A55', time: Date.now() - 5 * 3600_000, link: '/subastas/a2' },
  { id: 'n3', type: 'live-started',    icon: Radio,         color: 'text-salsa-500', title: 'Rosa está en vivo', body: '¡Subasta de moda empezó! 248 viendo', time: Date.now() - 18 * 60_000, link: '/en-vivo/s1' },
  { id: 'n4', type: 'chat-mention',    icon: MessageSquare, color: 'text-plin-500',  title: 'Carlos te mencionó', body: '@tú ¿te interesa el Galaxy A55?', time: Date.now() - 24 * 3600_000, link: '/mensajes?u=tech.lima' },
  { id: 'n5', type: 'new-follower',    icon: User,          color: 'text-salsa-500', title: 'Nuevo seguidor', body: 'Artesanías Cusco empezó a seguirte', time: Date.now() - 2 * 86400_000, link: '/vendedores/artesania.cusco' },
  { id: 'n6', type: 'auction-sold',    icon: Trophy,        color: 'text-lima-500',  title: '💰 Venta confirmada', body: 'Vestido artesanal — S/. 120.00', time: Date.now() - 3 * 86400_000, link: '/dashboard' },
  { id: 'n7', type: 'payment-verified',icon: Check,         color: 'text-lima-500',  title: '✓ Pago verificado', body: 'Yape de S/. 38.00 confirmado', time: Date.now() - 4 * 86400_000, link: '/pagos' },
] as const

export default function NotificationsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]))
  }

  const markAllAsRead = () => {
    setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)))
    toast({ title: '✅ Todo marcado como leído' })
  }

  const visible = NOTIFICATIONS.filter((n) => filter === 'all' || !readIds.has(n.id))
  const unreadCount = NOTIFICATIONS.length - readIds.size

  return (
    <AppShell title="Notificaciones" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
            }`}
          >
            Sin leer {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Marcar todo leído
        </Button>
      </div>

      {visible.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {filter === 'unread' ? 'Sin notificaciones nuevas.' : 'No tienes notificaciones.'}
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => {
            const isUnread = !readIds.has(n.id)
            return (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => markAsRead(n.id)}
                className="block"
              >
                <Card className={`p-4 hover:shadow-soft transition-shadow cursor-pointer ${isUnread ? 'border-l-4 border-l-salsa-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 ${n.color}`}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{timeAgoEs(new Date(n.time))}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-salsa-500 shrink-0 mt-2" />
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
