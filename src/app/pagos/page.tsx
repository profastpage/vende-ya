'use client'

import * as React from 'react'
import { Plus, CreditCard, Smartphone, Ticket, Check, Trash2 } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { PAYMENT_METHODS } from '@/lib/vendeda/constants'

const breadcrumbs: Breadcrumb[] = [{ label: 'Pagos' }]

const METHODS = [
  { id: 'yape',  label: 'Yape',  number: '987 654 321', verified: true,  default: true },
  { id: 'plin',  label: 'Plin',  number: '987 654 321', verified: true,  default: false },
  { id: 'card',  label: 'Visa •••• 4242', number: 'Expira 09/27', verified: true, default: false },
]

const TRANSACTIONS = [
  { id: 't1', desc: 'Polo algodón pima', method: 'yape', amount: 38, status: 'verified', date: 'hace 2 horas' },
  { id: 't2', desc: 'Vestido artesanal', method: 'plin', amount: 120, status: 'verified', date: 'ayer' },
  { id: 't3', desc: 'Samsung Galaxy A55', method: 'card', amount: 980, status: 'pending', date: 'hace 3 días' },
  { id: 't4', desc: 'Set skincare', method: 'yape', amount: 89, status: 'verified', date: 'hace 5 días' },
]

export default function PaymentsPage() {
  const { toast } = useToast()
  const [showAdd, setShowAdd] = React.useState(false)

  return (
    <AuthGuard>
    <AppShell title="Métodos de pago" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      {/* Payment methods */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tus métodos de pago</h3>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const pm = PAYMENT_METHODS[m.id as keyof typeof PAYMENT_METHODS]
            const Icon = m.id === 'card' ? CreditCard : m.id === 'yape' || m.id === 'plin' ? Smartphone : Ticket
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div
                  className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: pm?.color ?? '#64748B' }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{m.label}</span>
                    {m.verified && (
                      <Badge variant="secondary" className="text-[9px] bg-lima-100 text-lima-700">
                        <Check className="h-2.5 w-2.5 mr-0.5" /> Verificado
                      </Badge>
                    )}
                    {m.default && <Badge variant="secondary" className="text-[9px]">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.number}</p>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => toast({ title: 'Método eliminado', variant: 'destructive' })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Add new method (inline) */}
      {showAdd && (
        <Card className="p-5 mb-4 border-salsa-300">
          <h3 className="font-semibold mb-3">Agregar método de pago</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {['yape', 'plin', 'card', 'pagoefectivo'].map((id) => {
              const pm = PAYMENT_METHODS[id as keyof typeof PAYMENT_METHODS]
              return (
                <button
                  key={id}
                  onClick={() => toast({ title: `Agregar ${pm?.label}`, description: 'Formulario en desarrollo' })}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-salsa-300 transition-colors"
                >
                  <div
                    className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: pm?.color }}
                  >
                    {pm?.label.charAt(0)}
                  </div>
                  <span className="text-xs">{pm?.label}</span>
                </button>
              )
            })}
          </div>
          <Button variant="ghost" onClick={() => setShowAdd(false)} className="w-full">Cancelar</Button>
        </Card>
      )}

      {/* Transactions */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Transacciones recientes</h3>
        <div className="space-y-2">
          {TRANSACTIONS.map((t) => {
            const pm = PAYMENT_METHODS[t.method as keyof typeof PAYMENT_METHODS]
            return (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <div
                  className="h-8 w-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: pm?.color }}
                >
                  {pm?.label.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.desc}</p>
                  <p className="text-xs text-muted-foreground">{pm?.label} · {t.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">S/. {t.amount.toFixed(2)}</p>
                  <Badge
                    variant="secondary"
                    className={`text-[9px] ${
                      t.status === 'verified' ? 'bg-lima-100 text-lima-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t.status === 'verified' ? '✓ Verificado' : '⏳ Pendiente'}
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
