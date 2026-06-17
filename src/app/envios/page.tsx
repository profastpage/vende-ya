'use client'

import * as React from 'react'
import { Plus, MapPin, Package, Truck, Check, Edit, Trash2 } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SHIPPING_CARRIERS } from '@/lib/vendeda/constants'
import { formatPEN } from '@/lib/vendeda/format'

const breadcrumbs: Breadcrumb[] = [{ label: 'Envíos' }]

const ADDRESSES = [
  { id: 'a1', label: 'Casa', name: 'Rosa Quispe', line: 'Av. Javier Prado 1234, Dpto 502', district: 'San Isidro', city: 'Lima', zip: '15046', default: true },
  { id: 'a2', label: 'Trabajo', name: 'Rosa Quispe', line: 'Av. República de Panamá 3055', district: 'Surquillo', city: 'Lima', zip: '15047', default: false },
]

const ORDERS = [
  { id: 'o1', product: 'Polo algodón pima', seller: 'Rosa Quispe', carrier: 'olva', tracking: 'OLV123456789', status: 'shipped', total: 46, eta: 'Mañana' },
  { id: 'o2', product: 'Vestido artesanal', seller: 'Rosa Quispe', carrier: 'shalom', tracking: 'SHL987654321', status: 'delivered', total: 130, eta: 'Entregado ayer' },
  { id: 'o3', product: 'Set skincare natural', seller: 'Belleza Natural PE', carrier: 'marvisur', tracking: 'MRV456789123', status: 'pending', total: 101, eta: 'Pendiente envío' },
]

export default function ShippingPage() {
  const { toast } = useToast()

  return (
    <AuthGuard>
    <AppShell title="Envíos y direcciones" breadcrumbs={breadcrumbs} maxWidth="max-w-4xl">
      {/* Addresses */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Direcciones guardadas</h3>
          <Button size="sm" onClick={() => toast({ title: 'Nueva dirección', description: 'Formulario en desarrollo' })}>
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ADDRESSES.map((a) => (
            <Card key={a.id} className={`p-4 ${a.default ? 'border-salsa-300 bg-salsa-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-salsa-500" />
                  <span className="font-semibold text-sm">{a.label}</span>
                  {a.default && <Badge variant="secondary" className="text-[9px]">Default</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" aria-label="Eliminar">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.line}</p>
              <p className="text-xs text-muted-foreground">{a.district}, {a.city} {a.zip}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Carriers */}
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-salsa-500" /> Empresas de envío
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {SHIPPING_CARRIERS.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg border">
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.color }}>
                {c.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.estDays}</p>
              </div>
              <Badge variant="secondary" className="text-[9px]">Activo</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Orders */}
      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-salsa-500" /> Mis pedidos
        </h3>
        <div className="space-y-2">
          {ORDERS.map((o) => {
            const carrier = SHIPPING_CARRIERS.find((c) => c.id === o.carrier)
            const statusBadge = {
              shipped:   { label: 'En camino',  cls: 'bg-salsa-100 text-salsa-700' },
              delivered: { label: 'Entregado',  cls: 'bg-lima-100 text-lima-700' },
              pending:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
            }[o.status as keyof typeof statusBadge] ?? { label: o.status, cls: '' }
            return (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div
                  className="h-10 w-10 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: carrier?.color }}
                >
                  {carrier?.label.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.product}</p>
                  <p className="text-xs text-muted-foreground">
                    {carrier?.label} · {o.tracking} · {o.eta}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatPEN(o.total)}</p>
                  <Badge variant="secondary" className={`text-[9px] ${statusBadge.cls}`}>
                    {o.status === 'delivered' && <Check className="h-2.5 w-2.5 mr-0.5" />}
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </AppShell>
    </AuthGuard>
  )
}
