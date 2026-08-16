'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gavel, Trophy, Heart, MessageSquare, Bell, User, Radio, Check,
  BellOff, CheckCheck,
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { timeAgoEs } from '@/lib/vendeda/format'
import { staggerContainer, staggerItem } from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Notificaciones' }]

type NotifType =
  | 'auction-won'
  | 'bid-outbid'
  | 'live-started'
  | 'chat-mention'
  | 'new-follower'
  | 'auction-sold'
  | 'payment-verified'

interface NotifDef {
  type: NotifType
  icon: React.ElementType
  /** icon tailwind color, e.g. "text-lime-400" */
  iconColor: string
  /** background tailwind for icon circle, e.g. "bg-lime-500/15 border-lime-500/30" */
  iconBg: string
  /** left-border accent color for unread state, e.g. "border-lime-400" */
  accent: string
  title: string
  body: string
  time: number
  link: string
}

const NOTIFICATIONS: NotifDef[] = [
  {
    type: 'auction-won', icon: Trophy, iconColor: 'text-lime-400',
    iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400',
    title: 'Ganaste la subasta', body: 'Polo algodón pima por S/. 38.00',
    time: Date.now() - 2 * 3600_000, link: '/subastas/a1',
  },
  {
    type: 'bid-outbid', icon: Gavel, iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/30', accent: 'border-amber-400',
    title: 'Te superaron', body: 'Nueva puja de S/. 980 en Samsung A55',
    time: Date.now() - 5 * 3600_000, link: '/subastas/a2',
  },
  {
    type: 'live-started', icon: Radio, iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/30', accent: 'border-rose-400',
    title: 'Rosa está en vivo', body: '¡Subasta de moda empezó! 248 viendo',
    time: Date.now() - 18 * 60_000, link: '/en-vivo/s1',
  },
  {
    type: 'chat-mention', icon: MessageSquare, iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30', accent: 'border-sky-400',
    title: 'Carlos te mencionó', body: '@tú ¿te interesa el Galaxy A55?',
    time: Date.now() - 24 * 3600_000, link: '/mensajes?u=tech.lima',
  },
  {
    type: 'new-follower', icon: User, iconColor: 'text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/15 border-fuchsia-500/30', accent: 'border-fuchsia-400',
    title: 'Nuevo seguidor', body: 'Artesanías Cusco empezó a seguirte',
    time: Date.now() - 2 * 86400_000, link: '/vendedores/artesania.cusco',
  },
  {
    type: 'auction-sold', icon: Trophy, iconColor: 'text-lime-400',
    iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400',
    title: 'Venta confirmada', body: 'Vestido artesanal — S/. 120.00',
    time: Date.now() - 3 * 86400_000, link: '/dashboard',
  },
  {
    type: 'payment-verified', icon: Check, iconColor: 'text-lime-400',
    iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400',
    title: 'Pago verificado', body: 'Yape de S/. 38.00 confirmado',
    time: Date.now() - 4 * 86400_000, link: '/pagos',
  },
]

export default function NotificationsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]))
  }

  const markAllAsRead = () => {
    setReadIds(new Set(NOTIFICATIONS.map((n) => n.type + n.time)))
    toast({ title: 'Todo marcado como leído' })
  }

  // Composite id combining type+time so React keys are stable
  const idFor = (n: NotifDef) => n.type + n.time

  const visible = NOTIFICATIONS.filter((n) => filter === 'all' || !readIds.has(idFor(n)))
  const unreadCount = NOTIFICATIONS.length - readIds.size

  return (
    <AuthGuard>
      <StaticPageShell
        title="Notificaciones"
        breadcrumbs={breadcrumbs}
        maxWidth="max-w-3xl"
      >
        {/* Top control bar */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 h-9 rounded-lg text-sm font-bold transition-all border ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 border-amber-400/50 shadow-lg shadow-fuchsia-500/20'
                  : 'bg-muted border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 h-9 rounded-lg text-sm font-bold transition-all border flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 border-amber-400/50 shadow-lg shadow-fuchsia-500/20'
                  : 'bg-muted border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              Sin leer
              {unreadCount > 0 && (
                <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black ${
                  filter === 'unread' ? 'bg-background/30 text-zinc-950' : 'bg-amber-400 text-zinc-950'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold text-muted-foreground hover:text-amber-400 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todo leído
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl bg-card/80 border border-border p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-semibold">
              {filter === 'unread' ? 'Sin notificaciones nuevas' : 'No tienes notificaciones'}
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Cuando ocurra algo importante (pujas, ventas, mensajes), lo verás aquí.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            {visible.map((n) => {
              const id = idFor(n)
              const isUnread = !readIds.has(id)
              const Icon = n.icon
              return (
                <motion.div key={id} variants={staggerItem}>
                  <Link
                    href={n.link}
                    onClick={() => markAsRead(id)}
                    className="block group"
                  >
                    <div
                      className={`relative rounded-xl bg-card/80 border border-border backdrop-blur-sm p-4 transition-all hover:border-border hover:bg-card ${
                        isUnread ? `border-l-4 ${n.accent}` : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${n.iconBg}`}>
                          <Icon className={`h-5 w-5 ${n.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-foreground leading-snug">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                              {timeAgoEs(new Date(n.time))}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                        </div>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 shrink-0 mt-2 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Bottom helper */}
        <div className="mt-8 rounded-2xl bg-muted border border-border p-5 text-center">
          <Bell className="h-5 w-5 mx-auto mb-2 text-amber-400" />
          <p className="text-xs text-muted-foreground">
            Configura qué notificaciones recibir desde{' '}
            <Link href="/configuracion" className="text-amber-400 hover:text-amber-300 underline">
              Configuración
            </Link>
            .
          </p>
        </div>
      </StaticPageShell>
    </AuthGuard>
  )
}
