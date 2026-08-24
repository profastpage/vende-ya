'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Wallet, Shield, ArrowRight, Check, AlertCircle, Loader2,
  ArrowLeft, ChevronRight, ArrowDownToLine, ShieldCheck,
  TrendingUp, Clock, Banknote, CreditCard, Plug, Info,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/vendeda/routes'
import { formatPEN } from '@/lib/vendeda/format'
import { cn } from '@/lib/utils'

interface WalletTx {
  id: string
  concept: string
  buyer: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'in_escrow'
  method: 'yape' | 'plin' | 'card' | 'pagoefectivo'
}

// Mock transactions shown when wallet is active.
// In production these come from /api/wallet/transactions.
const MOCK_TXS: WalletTx[] = [
  { id: 'tx1', concept: 'Polo algodón pima — edición Lima', buyer: 'maria_92', amount: 45.50, date: 'hace 2 h', status: 'completed', method: 'yape' },
  { id: 'tx2', concept: 'Set skincare natural (subasta)', buyer: 'diego_lp', amount: 89.00, date: 'hace 5 h', status: 'in_escrow', method: 'plin' },
  { id: 'tx3', concept: 'Samsung Galaxy A55 5G 256GB', buyer: 'carlos.t', amount: 1290.00, date: 'hace 1 d', status: 'completed', method: 'card' },
  { id: 'tx4', concept: 'Manta de alpaca tejida a mano', buyer: 'rosa_q', amount: 320.00, date: 'hace 1 d', status: 'completed', method: 'yape' },
  { id: 'tx5', concept: 'Nike Air Force 1 — edición 40 aniversario', buyer: 'sneakers_aqp', amount: 380.00, date: 'hace 2 d', status: 'in_escrow', method: 'card' },
  { id: 'tx6', concept: 'Vestido artesanal bordado a mano', buyer: 'luisa.f', amount: 180.00, date: 'hace 3 d', status: 'completed', method: 'plin' },
]

const PAGE_TITLE = 'Mi billetera'

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  )
}

function WalletContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [linking, setLinking] = React.useState(false)

  // Wallet status (mirrors WalletOnboardingBanner fetch from /vender)
  const [wallet, setWallet] = React.useState<{
    loading: boolean
    status: 'active' | 'pending' | 'error' | null
    isVerified: boolean | null
    balance?: number
  }>({ loading: true, status: null, isVerified: null })

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.wallet) {
          setWallet({
            loading: false,
            status: data.wallet.status,
            isVerified: data.wallet.isVerified,
            balance: data.wallet.balance ?? 1247.50,
          })
        } else {
          setWallet({ loading: false, status: null, isVerified: null })
        }
      })
      .catch(() => setWallet({ loading: false, status: null, isVerified: null }))
  }, [])

  const handleLink = async () => {
    setLinking(true)
    try {
      // En producción esto abriría el OAuth de Mercado Pago en una ventana nueva
      // const authUrl = `https://auth.mercadopago.com.pe/authorization?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${CALLBACK}`;
      // window.location.href = authUrl;

      // Por ahora simulamos: registramos una wallet demo en DB
      const res = await fetch('/api/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewaySellerId: `MPL-DEMO-${Date.now()}`,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      toast({
        title: '✓ Billetera vinculada',
        description: 'Tu cuenta de Mercado Pago está conectada (modo demo).',
      })
      router.push(ROUTES.dashboard)
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'No se pudo vincular',
        variant: 'destructive',
      })
    } finally {
      setLinking(false)
    }
  }

  // Determine display status —
  // - active+verified → lime "Verificada"
  // - pending (status==='pending' OR not connected) → amber "Pendiente"
  // - error → rose "Requerir acción"
  const isActive = wallet.status === 'active' && wallet.isVerified === true
  const isError = wallet.status === 'error'
  const displayStatus: 'active' | 'pending' | 'error' = isActive
    ? 'active'
    : isError
    ? 'error'
    : 'pending'

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border pt-safe">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href={ROUTES.dashboard} aria-label="Volver" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold font-display truncate text-foreground">{PAGE_TITLE}</h1>
            <p className="text-[10px] text-muted-foreground truncate">Mercado Pago · Billetera</p>
          </div>
        </div>
      </header>

      {/* Desktop breadcrumb */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href={ROUTES.home} className="hover:text-foreground">Inicio</Link>
          <ChevronRight className="h-3 w-3 mx-1" />
          <Link href={ROUTES.dashboard} className="hover:text-foreground">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1" />
          <span className="text-foreground font-medium">{PAGE_TITLE}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* ─── Hero ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-3">
            <h1 className="text-3xl md:text-4xl font-black font-display text-foreground">Tu billetera</h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Gestiona tu conexión con Mercado Pago, consulta tu saldo disponible y revisa el historial de cobros.
              La comisión de Vende Ya se retiene automáticamente en cada transacción vía split payment, así que el monto que ves ya es neto.
            </p>
          </div>
        </motion.section>

        {/* ─── Balance card ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          {wallet.loading ? (
            <div className="rounded-3xl border border-border bg-card/80 p-6 animate-pulse">
              <div className="h-4 w-1/3 bg-muted rounded mb-4" />
              <div className="h-10 w-1/2 bg-muted rounded mb-3" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          ) : isActive ? (
            // Active — amber gradient balance
            <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/30 via-amber-600/15 to-background p-6 md:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-200/80 mb-1">Saldo disponible</p>
                  <p className="text-4xl md:text-5xl font-black font-mono text-foreground tabular-nums">
                    {formatPEN(wallet.balance ?? 0)}
                  </p>
                  <p className="text-xs text-amber-200/80 mt-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{formatPEN(284.50)} en los últimos 7 días
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-card text-foreground hover:bg-accent border border-border font-bold text-sm transition-colors active:scale-95">
                    <ArrowDownToLine className="h-4 w-4" /> Retirar a MP
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-muted hover:bg-accent text-foreground text-xs font-medium border border-border transition-colors">
                    Ver historial completo
                  </button>
                </div>
              </div>
              <div className="relative grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-200/70">En escrow</p>
                  <p className="text-lg font-bold font-mono text-foreground tabular-nums">{formatPEN(469.00)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-200/70">Ventas del mes</p>
                  <p className="text-lg font-bold font-mono text-foreground tabular-nums">{formatPEN(2314.50)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-200/70">Comisión pagada</p>
                  <p className="text-lg font-bold font-mono text-foreground tabular-nums">{formatPEN(277.74)}</p>
                </div>
              </div>
            </div>
          ) : (
            // Pending — amber-400/10 backdrop
            <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6 md:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                      <span className="text-amber-700 dark:text-amber-300 font-black text-xs">MP</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-amber-200/80">Mercado Pago</p>
                      <p className="text-sm font-bold text-amber-100">Billetera no verificada</p>
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-black font-mono text-muted-foreground/40 tabular-nums">S/. — — —</p>
                  <p className="text-sm text-amber-200/80 mt-2 leading-relaxed">
                    Para mostrar tu saldo disponible necesitas conectar y verificar tu cuenta de Mercado Pago.
                    Mientras tanto, las ventas se acumulan en escrow protegido hasta 7 días.
                  </p>
                </div>
                <div className="shrink-0">
                  <a
                    href="/api/wallet/oauth/redirect"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold text-sm shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Plug className="h-4 w-4" /> Conectar Mercado Pago
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* ─── Status card (big badge) ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              'h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0',
              displayStatus === 'active' && 'bg-lime-400/15 border-lime-400/30',
              displayStatus === 'pending' && 'bg-amber-400/15 border-amber-400/30',
              displayStatus === 'error' && 'bg-rose-500/15 border-rose-500/30',
            )}>
              {displayStatus === 'active' ? (
                <ShieldCheck className="h-6 w-6 text-lime-300" />
              ) : displayStatus === 'error' ? (
                <AlertCircle className="h-6 w-6 text-rose-300" />
              ) : (
                <Clock className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">Estado de verificación</h2>
                <StatusBadge status={displayStatus} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displayStatus === 'active' && (
                  <>
                    Tu cuenta está verificada y operativa. Recibes pagos en tiempo real, el split de comisiones
                    se ejecuta automáticamente y el escrow se libera en cuanto el comprador confirma la recepción.
                    Puedes retirar el saldo disponible a tu cuenta bancaria en cualquier momento sin costos adicionales.
                  </>
                )}
                {displayStatus === 'pending' && (
                  <>
                    Tu billetera está en proceso de verificación. Necesitas completar el KYC de Mercado Pago (DNI + selfie)
                    para habilitar cobros reales. El proceso tarda 1-2 días hábiles; mientras tanto puedes publicar productos
                    pero los pagos quedarán retenidos en escrow protegido hasta 7 días.
                  </>
                )}
                {displayStatus === 'error' && (
                  <>
                    Detectamos un problema con tu cuenta de Mercado Pago. Posibles causas: KYC rechazado, cuenta suspendida
                    o webhook de pagos no respondiendo. Revisa el panel de Mercado Pago o contáctanos para asistencia.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── Pending: step-by-step instructions ─── */}
        {!wallet.loading && !isActive && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Plug className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-foreground">Cómo conectar tu Mercado Pago</h2>
            </div>
            <ol className="space-y-3">
              {[
                {
                  n: 1,
                  title: 'Crea tu cuenta de Mercado Pago vendedor',
                  desc: 'Si no tienes una, regístrate en mercadopago.com.pe con tu DNI. Es gratis y tarda 5 minutos.',
                },
                {
                  n: 2,
                  title: 'Completa el KYC (DNI + selfie)',
                  desc: 'Sube una foto nítida de tu DNI y una selfie. La verificación tarda 1-2 días hábiles y es obligatoria para cobros reales.',
                },
                {
                  n: 3,
                  title: 'Conecta Mercado Pago a Vende Ya',
                  desc: 'Haz clic en "Conectar Mercado Pago" abajo y autoriza el acceso. Solo pedimos permiso de cobros y consulta de saldo.',
                },
                {
                  n: 4,
                  title: 'Verifica que el webhook esté activo',
                  desc: 'Vende Ya configura automáticamente el webhook de pagos. Recibirás una notificación de confirmación en menos de 1 minuto.',
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{step.n}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-semibold text-foreground text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 pt-5 border-t border-border">
              <Button
                onClick={handleLink}
                disabled={linking}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold border-0 shadow-lg shadow-fuchsia-500/30"
              >
                {linking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vinculando cuenta...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Conectar Mercado Pago
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Al continuar aceptas los{' '}
                <Link href={ROUTES.terminos} className="underline hover:text-muted-foreground">Términos y Condiciones</Link>
                {' '}y la{' '}
                <Link href={ROUTES.privacidad} className="underline hover:text-muted-foreground">Política de Privacidad</Link>.
              </p>
            </div>
          </motion.section>
        )}

        {/* ─── KYC required card (preserved from original) ─── */}
        {!wallet.loading && !isActive && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-100">Verificación KYC requerida</p>
                <p className="text-sm text-amber-200/80 mt-1 leading-relaxed">
                  Para activar cobros reales necesitas completar la verificación de identidad en Mercado Pago.
                  Esto incluye foto del DNI + selfie y tarda 1-2 días hábiles. Sin KYC los pagos quedan retenidos en escrow.
                </p>
                <a
                  href="https://www.mercadopago.com.pe/hub/centers/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-amber-200 underline font-semibold mt-3 hover:text-amber-100"
                >
                  Completar KYC en Mercado Pago <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.section>
        )}

        {/* ─── Transactions table (only if active) ─── */}
        {isActive && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-bold text-foreground">Transacciones recientes</h2>
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="px-2 py-2 font-medium">Concepto</th>
                    <th className="px-2 py-2 font-medium hidden md:table-cell">Comprador</th>
                    <th className="px-2 py-2 font-medium hidden sm:table-cell">Método</th>
                    <th className="px-2 py-2 font-medium">Estado</th>
                    <th className="px-2 py-2 font-medium text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TXS.map((tx) => (
                    <tr key={tx.id} className="border-b border-border hover:bg-muted">
                      <td className="px-2 py-3">
                        <div className="font-medium text-foreground line-clamp-1">{tx.concept}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{tx.buyer} · {tx.date}</div>
                        <div className="text-xs text-muted-foreground hidden md:block">{tx.date}</div>
                      </td>
                      <td className="px-2 py-3 hidden md:table-cell text-muted-foreground">@{tx.buyer}</td>
                      <td className="px-2 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          {tx.method}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <TxStatusBadge status={tx.status} />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <span className="font-mono font-semibold text-lime-300">
                          +{formatPEN(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* ─── Commission info card ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-5 w-5 text-fuchsia-400" />
            <h2 className="text-lg font-bold text-foreground">Estructura de comisiones</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Vende Ya aplica una comisión plana según el canal de venta. La pasarela de Mercado Pago cobra adicionalmente
            el costo de procesamiento. Todas las retenciones se calculan en la fuente — tú siempre recibes el neto exacto.
          </p>
          <div className="rounded-xl bg-black/30 border border-border p-4 text-sm space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comisión Vende Ya (en vivo)</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">12.00%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comisión Vende Ya (marketplace)</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">8.00%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Costo pasarela (3.9% + IGV)</span>
              <span className="font-mono font-bold text-muted-foreground">4.602%</span>
            </div>
            <div className="border-t border-border pt-2.5 mt-1 flex justify-between font-bold">
              <span className="text-foreground">Neto para ti (en vivo)</span>
              <span className="text-lime-300 font-mono">83.40%</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-foreground">Neto para ti (marketplace)</span>
              <span className="text-lime-300 font-mono">87.40%</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
              Ejemplo: una venta de S/ 100 en vivo → recibes S/ 83.40 netos. En marketplace → recibes S/ 87.40.
              Los retiros a tu banco son gratuitos y se acreditan en menos de 24 horas hábiles.
            </p>
          </div>
        </motion.section>

        {/* ─── Why link your wallet (3 benefits) ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-5 w-5 text-lime-400" />
            <h2 className="text-lg font-bold text-foreground">¿Por qué vincular tu cuenta?</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted border border-border">
              <Check className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Recibe pagos automáticamente</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  Cada venta se deposita directamente en tu cuenta Mercado Pago, sin gestiones manuales.
                  Compatible con Yape, Plin, tarjetas Visa/Mastercard y PagoEfectivo.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted border border-border">
              <Check className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Split automático de comisiones</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  Vende Ya retiene su comisión (12% en vivo / 8% marketplace) en la fuente.
                  Tú recibes el neto exacto sin trámites ni facturación adicional.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted border border-border">
              <Check className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Escrow protegido</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  El pago queda retenido hasta que el comprador recibe su producto. Cero fraudes, cero contracargos.
                  Si el comprador no confirma en 72 horas, el pago se libera automáticamente a tu favor.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// StatusBadge — active=lime / pending=amber / error=rose
// ─────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'active' | 'pending' | 'error' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-lime-400/15 text-lime-300 border-lime-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
        Verificada
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-rose-500/15 text-rose-300 border-rose-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        Requerir acción
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      Pendiente
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────
// TxStatusBadge — per-transaction status
// ─────────────────────────────────────────────────────────────────────
function TxStatusBadge({ status }: { status: 'completed' | 'pending' | 'in_escrow' }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-lime-400/15 text-lime-300 border-lime-400/30">
        <Check className="h-3 w-3" /> Completado
      </span>
    )
  }
  if (status === 'in_escrow') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30">
        <Clock className="h-3 w-3" /> En escrow
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-muted text-muted-foreground border-border">
      Pendiente
    </span>
  )
}
