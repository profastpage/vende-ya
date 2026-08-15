'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Plus, CreditCard, Smartphone, Ticket, Check, Trash2,
  Wallet, TrendingUp, Clock, Receipt,
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { PAYMENT_METHODS } from '@/lib/vendeda/constants'
import { formatPEN } from '@/lib/vendeda/format'
import {
  StatusBadge, GradientButton, GhostButton, staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Pagos' }]

const METHODS = [
  { id: 'yape', label: 'Yape', number: '987 654 321', verified: true, default: true },
  { id: 'plin', label: 'Plin', number: '987 654 321', verified: true, default: false },
  { id: 'card', label: 'Visa •••• 4242', number: 'Expira 09/27', verified: true, default: false },
] as const

const TRANSACTIONS = [
  { id: 't1', orderId: '#ORD-2381', desc: 'Polo algodón pima', method: 'yape', amount: 38, status: 'verified', date: 'hace 2 horas' },
  { id: 't2', orderId: '#ORD-2294', desc: 'Vestido artesanal', method: 'plin', amount: 120, status: 'verified', date: 'ayer' },
  { id: 't3', orderId: '#ORD-2101', desc: 'Samsung Galaxy A55', method: 'card', amount: 980, status: 'pending', date: 'hace 3 días' },
  { id: 't4', orderId: '#ORD-1987', desc: 'Set skincare', method: 'yape', amount: 89, status: 'verified', date: 'hace 5 días' },
  { id: 't5', orderId: '#ORD-1842', desc: 'Zapatilla Nike', method: 'plin', amount: 245, status: 'verified', date: 'hace 1 semana' },
] as const

const KPIS = [
  { label: 'Total gastado', value: 'S/. 1,372.00', icon: Wallet, accent: 'text-amber-400', gradient: 'bg-amber-500' },
  { label: 'Este mes', value: 'S/. 158.00', icon: TrendingUp, accent: 'text-lime-400', gradient: 'bg-lime-500', delta: '+12%' },
  { label: 'Pendientes', value: '1', icon: Clock, accent: 'text-amber-400', gradient: 'bg-amber-500' },
  { label: 'Transacciones', value: '5', icon: Receipt, accent: 'text-fuchsia-400', gradient: 'bg-fuchsia-500' },
] as const

export default function PaymentsPage() {
  const { toast } = useToast()
  const [showAdd, setShowAdd] = React.useState(false)

  return (
    <AuthGuard>
      <StaticPageShell
        title="Pagos"
        breadcrumbs={breadcrumbs}
        maxWidth="max-w-4xl"
      >
        {/* KPI summary */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        >
          {KPIS.map((kpi) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-4"
              >
                <div
                  className={`absolute -top-10 -right-10 h-28 w-28 rounded-full ${kpi.gradient} opacity-20 blur-3xl`}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                      {kpi.label}
                    </p>
                    <p className="mt-1 text-xl md:text-2xl font-black text-white tabular-nums">
                      {kpi.value}
                    </p>
                    {'delta' in kpi && kpi.delta && (
                      <p className={`mt-1 text-[11px] font-bold ${kpi.accent}`}>{kpi.delta}</p>
                    )}
                  </div>
                  <div className="rounded-xl p-2 bg-white/5 border border-white/10">
                    <Icon className={`h-5 w-5 ${kpi.accent}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Payment methods */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white text-base">Tus métodos de pago</h3>
            <GhostButton onClick={() => setShowAdd((v) => !v)} className="h-9 text-xs px-3">
              <Plus className="h-3.5 w-3.5" />
              {showAdd ? 'Cerrar' : 'Agregar'}
            </GhostButton>
          </div>

          <div className="space-y-2">
            {METHODS.map((m) => {
              const pm = PAYMENT_METHODS[m.id as keyof typeof PAYMENT_METHODS]
              const Icon = m.id === 'card' ? CreditCard : m.id === 'yape' || m.id === 'plin' ? Smartphone : Ticket
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: pm?.color ?? '#64748B' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.label}</span>
                      {m.verified && (
                        <StatusBadge variant="lime">
                          <Check className="h-2.5 w-2.5" /> Verificado
                        </StatusBadge>
                      )}
                      {m.default && <StatusBadge variant="amber">Default</StatusBadge>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.number}</p>
                  </div>
                  <button
                    onClick={() =>
                      toast({
                        title: 'Método eliminado',
                        description: 'Ya no podrás recibir pagos con este método',
                        variant: 'destructive',
                      })
                    }
                    className="h-9 w-9 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                    aria-label="Eliminar método"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add new method (inline) */}
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <h4 className="font-bold text-white text-sm mb-3">Agregar método de pago</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['yape', 'plin', 'card', 'pagoefectivo'].map((id) => {
                  const pm = PAYMENT_METHODS[id as keyof typeof PAYMENT_METHODS]
                  return (
                    <button
                      key={id}
                      onClick={() =>
                        toast({
                          title: `Agregar ${pm?.label}`,
                          description: 'Formulario en desarrollo',
                        })
                      }
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border-2 border-white/10 hover:border-amber-400/50 hover:bg-amber-400/5 transition-all"
                    >
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-black"
                        style={{ backgroundColor: pm?.color }}
                      >
                        {pm?.label.charAt(0)}
                      </div>
                      <span className="text-xs text-zinc-300">{pm?.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Transactions history */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-black text-white text-base">Transacciones recientes</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Historial de tus últimos pagos. Haz clic en una transacción para ver el detalle.
            </p>
          </div>

          {/* Table header (desktop) */}
          <div className="hidden md:grid grid-cols-[8rem_1fr_7rem_8rem_7rem] gap-3 px-5 py-2 text-[10px] uppercase tracking-wider text-zinc-500 font-bold border-b border-white/5">
            <span>Pedido</span>
            <span>Producto</span>
            <span>Método</span>
            <span>Estado</span>
            <span className="text-right">Monto</span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {TRANSACTIONS.map((t) => {
              const pm = PAYMENT_METHODS[t.method as keyof typeof PAYMENT_METHODS]
              const isVerified = t.status === 'verified'
              return (
                <motion.div
                  key={t.id}
                  variants={staggerItem}
                  className="grid grid-cols-2 md:grid-cols-[8rem_1fr_7rem_8rem_7rem] gap-3 px-5 py-3 items-center hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs font-mono text-amber-400">{t.orderId}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.desc}</p>
                    <p className="text-[10px] text-zinc-500 md:hidden">{pm?.label} · {t.date}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded flex items-center justify-center text-white text-[10px] font-black"
                      style={{ backgroundColor: pm?.color }}
                    >
                      {pm?.label.charAt(0)}
                    </div>
                    <span className="text-xs text-zinc-400">{pm?.label}</span>
                  </div>
                  <div>
                    {isVerified ? (
                      <StatusBadge variant="lime">
                        <Check className="h-2.5 w-2.5" /> Verificado
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="amber">
                        <Clock className="h-2.5 w-2.5" /> Pendiente
                      </StatusBadge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white tabular-nums">
                      {formatPEN(t.amount)}
                    </p>
                    <p className="text-[10px] text-zinc-500 hidden md:block">{t.date}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="p-4 border-t border-white/5 text-center">
            <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              Ver todas las transacciones →
            </button>
          </div>
        </div>
      </StaticPageShell>
    </AuthGuard>
  )
}
