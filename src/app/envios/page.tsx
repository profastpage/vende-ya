'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Plus, MapPin, Package, Truck, Check, Edit, Trash2,
  QrCode, Clock, CheckCircle2, Circle, PackageCheck,
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { formatPEN } from '@/lib/vendeda/format'
import {
  StatusBadge, GradientButton, staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Envíos' }]

const ADDRESSES = [
  { id: 'a1', label: 'Casa', name: 'Rosa Quispe', line: 'Av. Javier Prado 1234, Dpto 502', district: 'San Isidro', city: 'Lima', zip: '15046', default: true },
  { id: 'a2', label: 'Trabajo', name: 'Rosa Quispe', line: 'Av. República de Panamá 3055', district: 'Surquillo', city: 'Lima', zip: '15047', default: false },
] as const

type ShipmentStatus = 'pending' | 'shipped' | 'delivered'

interface Order {
  id: string
  orderId: string
  product: string
  seller: string
  carrier: string
  tracking: string
  status: ShipmentStatus
  total: number
  eta: string
  createdAt: string
}

const ORDERS: Order[] = [
  {
    id: 'o1', orderId: '#ORD-2381', product: 'Polo algodón pima', seller: 'Rosa Quispe',
    carrier: 'olva', tracking: 'OLV123456789', status: 'shipped',
    total: 46, eta: 'Mañana', createdAt: 'hace 2 días',
  },
  {
    id: 'o2', orderId: '#ORD-2294', product: 'Vestido artesanal', seller: 'Rosa Quispe',
    carrier: 'shalom', tracking: 'SHL987654321', status: 'delivered',
    total: 130, eta: 'Entregado ayer', createdAt: 'hace 5 días',
  },
  {
    id: 'o3', orderId: '#ORD-2101', product: 'Set skincare natural', seller: 'Belleza Natural PE',
    carrier: 'marvisur', tracking: 'MRV456789123', status: 'pending',
    total: 101, eta: 'Pendiente envío', createdAt: 'hace 6 horas',
  },
]

const STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: 'Pendiente',
  shipped: 'En tránsito',
  delivered: 'Entregado',
}

const STATUS_VARIANT: Record<ShipmentStatus, 'amber' | 'sky' | 'lime'> = {
  pending: 'amber',
  shipped: 'sky',
  delivered: 'lime',
}

const TIMELINE_STEPS: { key: ShipmentStatus; label: string; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Pedido', icon: Package },
  { key: 'shipped', label: 'En tránsito', icon: Truck },
  { key: 'delivered', label: 'Entregado', icon: PackageCheck },
]

function statusIndex(status: ShipmentStatus): number {
  return TIMELINE_STEPS.findIndex((s) => s.key === status)
}

export default function ShippingPage() {
  const { toast } = useToast()

  return (
    <AuthGuard>
      <StaticPageShell
        title="Envíos"
        breadcrumbs={breadcrumbs}
        maxWidth="max-w-4xl"
      >
        {/* Addresses */}
        <div className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-foreground text-base">Direcciones guardadas</h3>
            <GradientButton
              onClick={() => toast({ title: 'Nueva dirección', description: 'Formulario en desarrollo' })}
              className="h-9 text-xs px-3"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </GradientButton>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {ADDRESSES.map((a) => (
              <div
                key={a.id}
                className={`relative rounded-xl border p-4 transition-colors ${
                  a.default
                    ? 'border-amber-400/50 bg-amber-400/5'
                    : 'border-border bg-muted hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="font-bold text-foreground text-sm">{a.label}</span>
                    {a.default && <StatusBadge variant="amber">Default</StatusBadge>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toast({ title: 'Editar dirección' })}
                      className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-amber-400 transition-colors"
                      aria-label="Editar"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        toast({
                          title: 'Eliminar dirección',
                          variant: 'destructive',
                        })
                      }
                      className="h-7 w-7 rounded-md hover:bg-rose-500/10 flex items-center justify-center text-muted-foreground hover:text-rose-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.line}</p>
                <p className="text-xs text-muted-foreground">{a.district}, {a.city} {a.zip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Carriers */}
        <div className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-5 mb-4">
          <h3 className="font-black text-foreground text-base mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-400" /> Empresas de envío
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            {SHIPPING_CARRIERS.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border"
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground text-xs font-black shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.label.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.estDays}</p>
                </div>
                <StatusBadge variant="lime">Activo</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Orders / shipments with tracking */}
        <div className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-5">
          <h3 className="font-black text-foreground text-base mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-amber-400" /> Mis pedidos
          </h3>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {ORDERS.map((o) => {
              const carrier = SHIPPING_CARRIERS.find((c) => c.id === o.carrier)
              const currentStep = statusIndex(o.status)
              return (
                <motion.div
                  key={o.id}
                  variants={staggerItem}
                  className="rounded-xl bg-muted border border-border overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-foreground text-xs font-black shrink-0"
                      style={{ backgroundColor: carrier?.color }}
                    >
                      {carrier?.label.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">{o.product}</p>
                        <StatusBadge variant={STATUS_VARIANT[o.status]}>
                          {o.status === 'delivered' && <Check className="h-2.5 w-2.5" />}
                          {STATUS_LABEL[o.status]}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.orderId} · {carrier?.label} · {o.createdAt}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-foreground tabular-nums">
                        {formatPEN(o.total)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{o.eta}</p>
                    </div>
                  </div>

                  {/* Tracking timeline */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                          Tracking
                        </p>
                        <code className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                          {o.tracking}
                        </code>
                      </div>
                      <button
                        onClick={() => toast({ title: 'Código QR', description: o.tracking })}
                        className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted border border-border hover:bg-muted text-[10px] text-muted-foreground font-semibold transition-colors"
                      >
                        <QrCode className="h-3.5 w-3.5" /> Ver QR
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="relative flex items-center justify-between">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const StepIcon = step.icon
                        const done = idx <= currentStep
                        const isCurrent = idx === currentStep
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center relative">
                            {idx < TIMELINE_STEPS.length - 1 && (
                              <div
                                className={`absolute top-3.5 left-1/2 w-full h-0.5 -translate-y-0 ${
                                  idx < currentStep
                                    ? 'bg-gradient-to-r from-amber-400 to-fuchsia-500'
                                    : 'bg-muted'
                                }`}
                                aria-hidden
                              />
                            )}
                            <div
                              className={`relative z-10 h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                done
                                  ? 'bg-gradient-to-br from-amber-400 to-fuchsia-500 border-amber-300/50 text-zinc-950'
                                  : 'bg-card border-border text-muted-foreground'
                              } ${isCurrent && done ? 'ring-4 ring-amber-400/20' : ''}`}
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>
                            <span
                              className={`mt-1.5 text-[10px] font-bold ${
                                done ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      {o.status === 'delivered'
                        ? `Entregado el ${o.eta.replace('Entregado ', '')}. Califica al vendedor para ayudar a la comunidad.`
                        : o.status === 'shipped'
                        ? `En camino. ETA: ${o.eta}. Recibirás una notificación al entregarse.`
                        : `Pendiente de envío. El vendedor tiene 48h para despachar.`}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Empty state hint */}
          <p className="mt-4 text-xs text-muted-foreground text-center">
            ¿No ves tu pedido?{' '}
            <a href="/soporte" className="text-amber-400 hover:text-amber-300 underline">
              Contáctanos
            </a>{' '}
            y te ayudamos a rastrearlo.
          </p>
        </div>
      </StaticPageShell>
    </AuthGuard>
  )
}
