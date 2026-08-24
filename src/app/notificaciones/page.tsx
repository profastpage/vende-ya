'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Gavel, Trophy, Heart, MessageSquare, Bell, User, Radio, Check,
  BellOff, CheckCheck, Loader2
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { timeAgoEs } from '@/lib/vendeda/format'
import { staggerContainer, staggerItem } from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'
import { getNotifications, markAsRead as serverMarkAsRead, markAllAsRead as serverMarkAllAsRead } from './actions'

const breadcrumbs: Breadcrumb[] = [{ label: 'Notificaciones' }]

// Map types to icons and colors
const TYPE_DEFS: Record<string, any> = {
  'auction-won': { icon: Trophy, iconColor: 'text-lime-400', iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400' },
  'auction-sold': { icon: Trophy, iconColor: 'text-lime-400', iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400' },
  'bid-outbid': { icon: Gavel, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/15 border-amber-500/30', accent: 'border-amber-400' },
  'live-started': { icon: Radio, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/15 border-rose-500/30', accent: 'border-rose-400' },
  'chat-mention': { icon: MessageSquare, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/15 border-sky-500/30', accent: 'border-sky-400' },
  'new-follower': { icon: User, iconColor: 'text-fuchsia-400', iconBg: 'bg-fuchsia-500/15 border-fuchsia-500/30', accent: 'border-fuchsia-400' },
  'payment-verified': { icon: Check, iconColor: 'text-lime-400', iconBg: 'bg-lime-500/15 border-lime-500/30', accent: 'border-lime-400' },
}
const DEFAULT_DEF = { icon: Bell, iconColor: 'text-muted-foreground', iconBg: 'bg-muted border-border', accent: 'border-muted-foreground' }

export default function NotificationsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    getNotifications().then(data => {
      setNotifications(data)
      setLoading(false)
    })
  }, [])

  const markAsRead = async (id: string) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await serverMarkAsRead(id)
  }

  const markAllAsRead = async () => {
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await serverMarkAllAsRead()
    toast({ title: 'Todo marcado como leído' })
  }

  const visible = notifications.filter((n) => filter === 'all' || !n.isRead)
  const unreadCount = notifications.filter(n => !n.isRead).length

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

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
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
              const def = TYPE_DEFS[n.type] || DEFAULT_DEF
              const Icon = def.icon
              return (
                <motion.div key={n.id} variants={staggerItem}>
                  <Link
                    href={n.linkUrl || '#'}
                    onClick={() => markAsRead(n.id)}
                    className="block group"
                  >
                    <div
                      className={`relative rounded-xl bg-card/80 border border-border backdrop-blur-sm p-4 transition-all hover:border-border hover:bg-card ${
                        !n.isRead ? `border-l-4 ${def.accent}` : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${def.iconBg}`}>
                          <Icon className={`h-5 w-5 ${def.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-foreground leading-snug">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                              {timeAgoEs(new Date(n.createdAt))}
                            </span>
                          </div>
                          {n.body && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {n.body}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </StaticPageShell>
    </AuthGuard>
  )
}