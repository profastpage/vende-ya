'use client'

/* ------------------------------------------------------------------ */
/* Seller Command Center — Ultra Inmersiva dark premium dashboard      */
/* Pure dark (bg-background) · glassmorphism · neon accents · bento     */
/* NO AppShell — navbar rendered at the layout level (layout.tsx).    */
/* ------------------------------------------------------------------ */

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, Wallet, Bell, ShoppingBag,
  AlertTriangle, Package, Loader2, Truck, ShieldCheck,
  Radio, Eye, BadgeCheck, Gavel, Tag, Video, Clock,
  ExternalLink, CreditCard, Smartphone, Zap, ChevronRight,
  Trophy, MessageSquare, Heart, Settings, ShieldAlert,
} from 'lucide-react'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { PushSubscribeButton } from '@/components/vendeda/PWA'
import { formatPEN, timeAgoEs, initials } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import type { Profile } from '@/lib/vendeda/types'
import { cn } from '@/lib/utils'
import { requestPayout } from './actions'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/* Framer Motion variants                                              */
/* ------------------------------------------------------------------ */
const KPI_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
} as const

const KPI_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const

const SECTION_MOTION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} as const

/* ------------------------------------------------------------------ */
/* Accent palette — matches Live Room + Marketplace visual language   */
/* ------------------------------------------------------------------ */
type KpiAccent = 'rose' | 'amber' | 'fuchsia' | 'lime' | 'purple' | 'sky'

const KPI_ACCENTS: Record<KpiAccent, { text: string; gradient: string }> = {
  rose:    { text: 'text-rose-400',    gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
  amber:   { text: 'text-amber-600 dark:text-amber-400',   gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  fuchsia: { text: 'text-fuchsia-400', gradient: 'linear-gradient(135deg, #d946ef, #f0abfc)' },
  lime:    { text: 'text-lime-400',    gradient: 'linear-gradient(135deg, #84cc16, #bef264)' },
  purple:  { text: 'text-purple-400',  gradient: 'linear-gradient(135deg, #a855f7, #d8b4fe)' },
  sky:     { text: 'text-sky-400',     gradient: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)' },
}

/* ------------------------------------------------------------------ */
/* Seller dashboard API types (preserved from prior version)          */
/* ------------------------------------------------------------------ */
interface SellerDashboardData {
  wallet: {
    id: string;
    gatewaySellerId: string;
    isVerified: boolean;
    status: string;
  };
  escrow: {
    id: string;
    availableBalance: number;
    frozenBalance: number;
    payouts: any[];
  };
  summary: {
    totalSales: number;
    totalCommissions: number;
    totalGatewayFees: number;
    totalNet: number;
    pendingEscrow: number;
  };
  recentOrders: Array<{
    status: string;
    id: string;
    buyerId: string;
    source: string;
    totalAmount: number;
    platformCommissionAmount: number;
    gatewayFeeAmount: number;
    sellerNetAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    gatewayTransactionId: string | null;
    createdAt: string;
    shipment?: {
      trackingCode: string | null;
      shipmentStatus: string;
      pdfLabelUrl: string | null;
    } | null;
  }>;
  pendingDropoffs: Array<{
    order: { id: string; totalAmount: number; buyerId: string };
    shipment: { trackingCode: string | null; pdfLabelUrl: string | null };
  }>;
  copyrightReports: Array<{
    id: string;
    status: string;
    reporterEmail: string;
    createdAt: string;
    infringedBrand: string;
  }>;
  notifications: any[];
  alerts: Array<{ level: 'info' | 'warning' | 'critical'; message: string }>;
}

type PendingDropoff = SellerDashboardData['pendingDropoffs'][number]
type RecentOrder = SellerDashboardData['recentOrders'][number]
type WalletInfo = SellerDashboardData['wallet']

/* ================================================================== */
/* PAGE                                                                */
/* ================================================================== */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const { user: authUser } = useAuth()
  // Use auth user if available, else fall back to mock for demo mode
  const user: Profile = authUser as unknown as Profile

  // Pull seller dashboard data (wallet, orders, summary, dropoffs, alerts).
  // Polls every 30s — same logic as the prior implementation.
  const effectiveSellerId = authUser?.id ?? user.id ?? 'demo-seller'
  const { data, isLoading, error } = useSellerDashboard(effectiveSellerId)

  // KPI values — fall back to mock when data hasn't loaded yet
  const ventasHoy = data?.summary?.totalSales ?? 0
  const ingresosDelta = "0% mes"
  const subastasActivas = 0
  const espectadoresHoy = 2418

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="w-full max-w-[1200px] mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-24 md:pb-12">
        {/* ─── HERO HEADER ─────────────────────────────────── */}
        <HeroHeader
          user={user}
          isDemo={authUser?.isDemo ?? true}
          walletActive={data?.wallet?.status === 'active'}
        />

        {/* ─── MODERATION ALERTS BANNER (conditional) ──────── */}
        {data && data.alerts.length > 0 && (
          <AlertsBanner alerts={data.alerts} />
        )}

        {/* ─── BENTO KPI GRID (stagger entrance) ──────────── */}
        <motion.section
          variants={KPI_CONTAINER_VARIANTS}
          initial="hidden"
          animate="visible"
          aria-label="Métricas clave"
          className="mt-5 md:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <BentoKpiCard
            icon={Tag}
            label="Ventas hoy"
            value={`S/ ${(ventasHoy || 0).toLocaleString('es-PE')}`}
            delta="▲ +12 hoy"
            sub="vs. ayer"
            accent="lime"
          />
          <BentoKpiCard
            icon={TrendingUp}
            label="Ingresos"
            value={ingresosDelta}
            delta="Tendencia alcista"
            sub="Últimos 30 días"
            accent="amber"
            sparkline
          />
          <BentoKpiCard
            icon={Gavel}
            label="Subastas"
            value={`${subastasActivas} activas`}
            delta="▲ LIVE"
            sub="2 cerrando pronto"
            accent="rose"
          />
          <BentoKpiCard
            icon={Eye}
            label="Espectadores"
            value={(espectadoresHoy || 0).toLocaleString('es-PE')}
            delta="▲ +320"
            sub="Pico de hoy"
            accent="fuchsia"
          />
        </motion.section>

        {/* QUICK ACTIONS */}
        <div className="mt-5 md:mt-6">
          <QuickActionsFooter />
        </div>

        {/* ─── 2-COL: STREAM ENGINE + WALLET ──────────────── */}
        <section className="mt-5 md:mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
          <StreamEngineLauncher />
          <WalletPanel
              wallet={data?.wallet ?? null}
              summary={data?.summary ?? null}
              escrow={data?.escrow ?? null}
              isLoading={isLoading}
              error={error}
            />
        </section>

        {/* ─── SHALOM LOGISTICS ────────────────────────────── */}
        <ShalomLogistics dropoffs={data?.pendingDropoffs ?? []} />

        {/* ─── RECENT ORDERS + ACTIVITY FEED ───────────────── */}
        <section className="mt-5 md:mt-6 grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <RecentOrdersCard
              orders={data?.recentOrders ?? []}
              isLoading={isLoading}
            />
          </div>
          <ReputationCard user={user} reviews={(data as any)?.reviews ?? []} />
          <ActivityFeed notifications={data?.notifications ?? []} />
        </section>

        {/* ─── COPYRIGHT REPORTS (conditional) ───────────── */}
        {data && data.copyrightReports.length > 0 && (
          <CopyrightReportsCard reports={data.copyrightReports} />
        )}

        {/* ─── QUICK ACTIONS FOOTER ───────────────────────── */}
        <QuickActionsFooter />
      </main>
    </div>
  )
}

/* ================================================================== */
/* HERO HEADER                                                         */
/* ================================================================== */
function HeroHeader({
  user,
  isDemo,
  walletActive,
}: {
  user: Profile
  isDemo: boolean
  walletActive: boolean
}) {
  const firstName = user.displayName.split(' ')[0] || user.displayName
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-muted backdrop-blur-xl border border-border p-5 md:p-7"
    >
      {/* Ambient glow */}
      
      

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* Avatar + greeting */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-lg md:text-xl font-black text-foreground">
                    {initials(user.displayName)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-foreground">
                Hola, {firstName}
              </h1>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verificado
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isDemo ? 'Modo demo' : 'En sesión'}
              </span>
            </div>
            <p className="mt-1.5 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Tu comando de ventas en tiempo real. Aquí ves cada ingreso, cada puja, cada envío y cada espectador conectado, todo en un solo panel.
              {' '}
              {walletActive
                ? 'Tu wallet de Mercado Pago está activa y lista para recibir cobros con Yape, Plin y tarjetas.'
                : 'Conecta Mercado Pago para desbloquear el cobro instantáneo y el split automático de comisiones.'}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              @{user.username} · {(user?.followerCount || 0).toLocaleString('es-PE')} seguidores · {user?.salesCount || 0} ventas · ⭐ {(user?.rating || 0).toFixed(1)}
            </p>
          </div>
        </div>

        {/* CTA cluster */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          {!walletActive && (
            <a
              href="/api/wallet/oauth/redirect"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-500 hover:from-amber-400 hover:to-fuchsia-400 text-zinc-950 font-black text-xs shadow-lg shadow-fuchsia-500/30 active:scale-95 transition-all"
            >
              <Wallet className="h-4 w-4" /> Conectar Mercado Pago
            </a>
          )}
          <Link
            href={ROUTES.live}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-bold text-xs active:scale-95 transition-all"
          >
            <Radio className="h-4 w-4 text-rose-400" /> Ir al en vivo
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

/* ================================================================== */
/* BENTO KPI CARD                                                      */
/* ================================================================== */
function BentoKpiCard({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent,
  sparkline,
}: {
  icon: React.ElementType
  label: string
  value: string
  delta: string
  sub: string
  accent: KpiAccent
  sparkline?: boolean
}) {
  const colors = KPI_ACCENTS[accent]
  return (
    <motion.div
      variants={KPI_ITEM_VARIANTS}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl bg-card/80 border border-border backdrop-blur-xl p-4 md:p-5"
    >
      
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
          <p className="mt-1 text-xl md:text-2xl font-black text-foreground tabular-nums truncate">
            {value}
          </p>
          <p className={cn('mt-1 text-[11px] font-bold', colors.text)}>{delta}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
        </div>
        <div className="rounded-xl p-2 bg-muted border border-border shrink-0">
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
      </div>
      {sparkline && (
        <div className="relative mt-3 h-8 flex items-end gap-0.5">
          {[0.4, 0.55, 0.5, 0.7, 0.65, 0.85, 0.78, 0.95, 0.88, 1].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-amber-500/40 to-amber-400/90"
              style={{ height: `${h * 100}%`, opacity: 0.4 + (h * 0.6) }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ================================================================== */
/* STREAM ENGINE LAUNCHER                                              */
/* ================================================================== */
function StreamEngineLauncher() {
  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-card to-fuchsia-900/30 border border-fuchsia-500/20 p-5 md:p-6"
    >
      
      

      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black tracking-wider uppercase">
            <Video className="h-3 w-3" /> Stream Engine
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-medium">
            <Clock className="h-3 w-3" /> Listo en 30s
          </span>
        </div>

        <h2 className="mt-3 text-xl md:text-2xl font-black text-foreground">
          ¿Listo para retransmitir?
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">
          Inicia tu transmisión en vivo, recibe pujas en tiempo real y cierra ventas con Yape o Plin al instante.
          El engine distribuye el video en adaptativo y baja latencia (menos de 2 segundos) para que tus compradores
          no se pierdan ninguna puja. Cada espectador puede pujar sin salir del stream.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Link
            href={ROUTES.vender}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-foreground font-black text-xs shadow-lg shadow-purple-500/30 active:scale-95 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Iniciar transmisión
          </Link>
          <Link
            href={ROUTES.vender}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-accent text-foreground font-bold text-xs active:scale-95 transition-all"
          >
            <Clock className="h-4 w-4 text-fuchsia-400" /> Programar stream
          </Link>
        </div>

        {/* Mini live preview placeholder */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
          <div className="rounded-lg bg-muted border border-border px-2.5 py-2">
            <p className="text-muted-foreground uppercase tracking-wider font-bold">Latencia</p>
            <p className="text-foreground font-black tabular-nums">1.8s</p>
          </div>
          <div className="rounded-lg bg-muted border border-border px-2.5 py-2">
            <p className="text-muted-foreground uppercase tracking-wider font-bold">Bitrate</p>
            <p className="text-foreground font-black tabular-nums">4.5 Mbps</p>
          </div>
          <div className="rounded-lg bg-muted border border-border px-2.5 py-2">
            <p className="text-muted-foreground uppercase tracking-wider font-bold">Calidad</p>
            <p className="text-foreground font-black">1080p60</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* WALLET PANEL — status badge + Mercado Pago OAuth CTA                */
/* ================================================================== */
function WalletPanel({
  wallet,
  summary,
  escrow,
  isLoading,
  error,
}: {
  wallet: WalletInfo | null
  summary: SellerDashboardData['summary'] | null
  escrow: SellerDashboardData['escrow'] | null
  isLoading: boolean
  error: string | null
}) {
  const [showPayout, setShowPayout] = React.useState(false);
  const { user } = useAuth() as { user: any };

  const isActive = wallet?.status === 'active'

  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
      className="relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6"
    >
      

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl p-2 bg-muted border border-border">
              <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-black text-foreground">Wallet & Pagos</h3>
          </div>
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted border border-border text-muted-foreground text-[10px] font-bold uppercase">
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando
            </span>
          ) : isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-lime-500/10 border border-lime-400/30 text-lime-400 text-[10px] font-black uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" /> Activa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
              <Clock className="h-3 w-3" /> Pendiente
            </span>
          )}
        </div>

        {error && !wallet && (
          <p className="mt-3 text-xs text-muted-foreground">
            No pudimos contactar tu wallet todavía. Esto es normal si aún no la registras en Vende Ya. {error}
          </p>
        )}

        {isActive && wallet ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu wallet de Mercado Pago está conectada y operativa. Recibes el 90% neto de cada venta;
              Vende Ya retiene la comisión automáticamente y libera el saldo a tu cuenta bancaria en máximo 24h hábiles.
              Las transacciones con Yape y Plin se acreditan en el instante.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-muted border border-border px-3 py-2">
                <p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">KYC</p>
                <p className={cn('font-black', wallet.isVerified ? 'text-lime-400' : 'text-rose-400')}>
                  {wallet.isVerified ? '✓ Verificada' : '✗ Pendiente'}
                </p>
              </div>
              <div className="rounded-lg bg-muted border border-border px-3 py-2">
                <p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Estado</p>
                <p className="font-black text-lime-400 capitalize">{wallet.status}</p>
              </div>
              {summary && (
                <>
                  <div className="rounded-lg bg-muted border border-border px-3 py-2">
                    <p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Disponible (Retiro)</p>
                    <p className="font-black text-lime-400 tabular-nums">{formatPEN(escrow?.availableBalance || 0)}</p>
                    {escrow && escrow.availableBalance > 0 && (
                      <button onClick={() => setShowPayout(true)} className="mt-2 w-full text-[10px] font-bold bg-lime-500/20 text-lime-400 border border-lime-500/30 py-1 rounded-md hover:bg-lime-500/30 transition-colors">Retirar</button>
                    )}
                  </div>
                  <div className="rounded-lg bg-muted border border-border px-3 py-2">
                    <p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Retenido (Escrow)</p>
                    <p className="font-black text-amber-600 dark:text-amber-400 tabular-nums">{formatPEN(escrow?.frozenBalance || 0)}</p>
                  </div>
                </>
              )}
              <div className="col-span-2 rounded-lg bg-muted border border-border px-3 py-2">
                <p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Gateway Seller ID</p>
                <p className="font-mono text-amber-600 dark:text-amber-400 break-all">{wallet.gatewaySellerId}</p>
              </div>
            </div>
            <Link
              href={ROUTES.pagos}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:text-amber-300"
            >
              Ver detalle de pagos <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conecta Mercado Pago para empezar a recibir pagos con Yape, Plin y tarjetas.
              Habilitamos el split automático de comisiones: recibes el 90% neto, nosotros retenemos el 10% en el momento del cobro.
              Sin mensualidades, solo pagas por venta efectiva.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border">
                <Smartphone className="h-3 w-3 text-lime-400" /> Yape
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border">
                <Smartphone className="h-3 w-3 text-sky-400" /> Plin
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border">
                <CreditCard className="h-3 w-3 text-fuchsia-400" /> Tarjetas
              </span>
            </div>
            <a
              href="/api/wallet/oauth/redirect"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-fuchsia-500 hover:from-amber-400 hover:to-fuchsia-400 text-zinc-950 font-black text-xs shadow-lg shadow-fuchsia-500/30 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Wallet className="h-4 w-4" /> Conectar Mercado Pago
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* SHALOM LOGISTICS                                                    */
/* ================================================================== */
type ShipmentStatus = 'pendiente' | 'transit' | 'entregado' | 'problem'

const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, {
  label: string
  badge: string
  dot: string
}> = {
  pendiente: { label: 'Pendiente',   badge: 'bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
  transit:   { label: 'En tránsito', badge: 'bg-sky-500/10 border-sky-400/30 text-sky-400',      dot: 'bg-sky-400' },
  entregado: { label: 'Entregado',   badge: 'bg-lime-500/10 border-lime-400/30 text-lime-400',   dot: 'bg-lime-400' },
  problem:   { label: 'Problema',    badge: 'bg-rose-500/10 border-rose-400/30 text-rose-400',   dot: 'bg-rose-400' },
}

interface ShipmentRow {
  orderId: string
  trackingCode: string | null
  status: ShipmentStatus
  agency: string
  pdfLabelUrl?: string | null
  amount: number
}

function ShalomLogistics({ dropoffs }: { dropoffs: PendingDropoff[] }) {
  // Real rows from API + mock fallback so the table always has content.
  const realRows: ShipmentRow[] = dropoffs.map((d) => ({
    orderId: d.order.id,
    trackingCode: d.shipment.trackingCode,
    status: 'pendiente' as ShipmentStatus,
    agency: 'Shalom Express',
    pdfLabelUrl: d.shipment.pdfLabelUrl,
    amount: d.order.totalAmount,
  }))

  
  const rows = realRows;

  return (
    <motion.section
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="mt-5 md:mt-6 relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6"
    >
      

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl p-2 bg-muted border border-border">
              <Truck className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">Shalom Logística</h3>
              <p className="text-[11px] text-muted-foreground">Envíos recientes y estado de entrega</p>
            </div>
          </div>
          <Link
            href={ROUTES.envios}
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
          >
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-bold border-b border-border">
                <th className="py-2 pr-3 font-bold">Orden</th>
                <th className="py-2 pr-3 font-bold">Tracking</th>
                <th className="py-2 pr-3 font-bold hidden sm:table-cell">Agencia</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 pr-3 font-bold text-right">Monto</th>
                <th className="py-2 pl-3 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const cfg = SHIPMENT_STATUS_CONFIG[row.status]
                return (
                  <tr
                    key={row.orderId}
                    className="border-b border-border hover:bg-muted transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <span className="font-mono text-xs text-muted-foreground">{row.orderId}</span>
                    </td>
                    <td className="py-3 pr-3">
                      {row.trackingCode ? (
                        <span className="font-mono text-xs text-amber-600 dark:text-amber-400">{row.trackingCode}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sin generar</span>
                      )}
                    </td>
                    <td className="py-3 pr-3 hidden sm:table-cell text-xs text-muted-foreground">
                      {row.agency}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                          cfg.badge,
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right font-bold text-foreground tabular-nums">
                      {formatPEN(row.amount)}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {row.pdfLabelUrl ? (
                        <a
                          href={row.pdfLabelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:bg-muted"
                        >
                          <Package className="h-3 w-3" /> Guía
                        </a>
                      ) : (
                        <Link
                          href={ROUTES.envios}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:bg-muted"
                        >
                          <ExternalLink className="h-3 w-3" /> Seguir
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Las guías se generan automáticamente con Shalom al confirmar el pago. Imprímelas antes de acercarte
          al punto de dropoff más cercano. El cliente recibe el código de seguimiento por WhatsApp y push notification
          en tiempo real, y puede rastrear su pedido desde el link enviado.
        </p>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/* RECENT ORDERS CARD                                                  */
/* ================================================================== */
const PAYMENT_STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  released:    { label: 'Liberado',   badge: 'bg-lime-500/10 border-lime-400/30 text-lime-400' },
  escrow_hold: { label: 'En escrow',  badge: 'bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-400' },
  paid:        { label: 'Pagado',    badge: 'bg-sky-500/10 border-sky-400/30 text-sky-400' },
  refunded:    { label: 'Reembolsado', badge: 'bg-rose-500/10 border-rose-400/30 text-rose-400' },
  pending:     { label: 'Pendiente',  badge: 'bg-muted border-border text-muted-foreground' },
}


function RecentOrdersCard({
  orders,
  isLoading,
}: {
  orders: RecentOrder[]
  isLoading: boolean
}) {
  const list = orders;

  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
      className="relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6 h-full"
    >
      

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl p-2 bg-muted border border-border">
              <ShoppingBag className="h-4 w-4 text-lime-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">Órdenes recientes</h3>
              <p className="text-[11px] text-muted-foreground">
                {isLoading ? 'Cargando órdenes…' : `${list.length} órdenes mostradas`}
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.pagos}
            className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 hover:text-lime-300"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {list.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                Aún no tienes órdenes. ¡Empieza a vender/comprar!
              </div>
            ) : list.map((o) => {
            const statusCfg =
              PAYMENT_STATUS_CONFIG[o.paymentStatus] ?? PAYMENT_STATUS_CONFIG.pending
            return (
              <div
                key={o.id}
                className="rounded-xl border border-border bg-muted hover:bg-accent transition-colors p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-400">#{o.id}</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border',
                        o.source === 'live_stream'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-400/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-400/20',
                      )}
                    >
                      {o.source === 'live_stream' ? 'En vivo' : 'Marketplace'}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {timeAgoEs(new Date(o.createdAt))}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Total</p>
                    <p className="text-foreground font-bold tabular-nums">{formatPEN(o.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Comisión</p>
                    <p className="text-rose-400 font-bold tabular-nums">-{formatPEN(o.platformCommissionAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Pasarela</p>
                    <p className="text-rose-400 font-bold tabular-nums">-{formatPEN(o.gatewayFeeAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wider text-[9px] font-bold">Neto</p>
                    <p className="text-lime-400 font-bold tabular-nums">{formatPEN(o.sellerNetAmount)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider',
                      statusCfg.badge,
                    )}
                  >
                    {statusCfg.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {o.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                {o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
                  <div className="mt-2 text-right">
                    <button onClick={async () => {
                      if(confirm("¿Confirmas que el producto ha sido entregado al comprador? Los fondos pasarán de Escrow a Disponible.")) {
                        try {
                          const { markOrderAsDelivered } = await import('@/app/actions/logistics');
                          await markOrderAsDelivered(o.id);
                          alert('¡Orden completada! Fondos liberados.');
                          window.location.reload();
                        } catch(e) {
                          alert('Error: ' + (e instanceof Error ? e.message : String(e)));
                        }
                      }
                    }} className="text-[10px] font-bold bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors">
                      Marcar Entregado
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* ACTIVITY FEED                                                      */
/* ================================================================== */
interface ActivityItem {
  icon: React.ElementType
  accent: KpiAccent
  title: string
  desc: string
  time: string
}


function ActivityFeed({ notifications }: { notifications: any[] }) {
  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6 h-full"
    >
      

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl p-2 bg-muted border border-border">
            <Bell className="h-4 w-4 text-fuchsia-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Actividad reciente</h3>
            <p className="text-[11px] text-muted-foreground">Tus últimas notificaciones de venta</p>
          </div>
        </div>

        <div className="space-y-1">
          {(!notifications || notifications.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              No hay actividad aún.
            </div>
          ) : notifications.map((item: any, i: number) => {
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="rounded-lg p-1.5 bg-muted border border-border shrink-0">
                  <Bell className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.body || ''}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                  {item.createdAt ? timeAgoEs(new Date(item.createdAt)) : ''}
                </span>
              </div>
            )
          })}
        </div>

        <Link
          href={ROUTES.notificaciones}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300"
        >
          Ver todas las notificaciones <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* MODERATION ALERTS BANNER                                            */
/* ================================================================== */
function AlertsBanner({ alerts }: { alerts: SellerDashboardData['alerts'] }) {
  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="mt-5 md:mt-6 relative overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-500/5 backdrop-blur-xl p-4 md:p-5"
    >
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Alertas de moderación
          </h3>
        </div>
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={cn(
                'text-xs px-3 py-2 rounded-lg border',
                a.level === 'critical'
                  ? 'bg-rose-500/10 border-rose-400/30 text-rose-300'
                  : a.level === 'warning'
                    ? 'bg-amber-500/10 border-amber-400/30 text-amber-200'
                    : 'bg-sky-500/10 border-sky-400/30 text-sky-300',
              )}
            >
              {a.message}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ================================================================== */
/* COPYRIGHT REPORTS CARD                                             */
/* ================================================================== */
function CopyrightReportsCard({
  reports,
}: {
  reports: SellerDashboardData['copyrightReports']
}) {
  return (
    <motion.section
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="mt-5 md:mt-6 relative overflow-hidden rounded-3xl bg-card/80 border border-rose-500/20 backdrop-blur-xl p-5 md:p-6"
    >
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl p-2 bg-rose-500/10 border border-rose-400/30">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Reportes de PI contra ti</h3>
            <p className="text-[11px] text-muted-foreground">
              {reports.length} reporte{reports.length !== 1 ? 's' : ''} de propiedad intellectual
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl bg-muted border border-border"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-foreground">Marca: {r.infringedBrand}</p>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
                    r.status === 'pending' || r.status === 'resolved_ban'
                      ? 'bg-rose-500/10 border-rose-400/30 text-rose-400'
                      : r.status === 'investigating'
                        ? 'bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-400'
                        : 'bg-muted border-border text-muted-foreground',
                  )}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Reportado por {r.reporterEmail} · {timeAgoEs(new Date(r.createdAt))}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          Si crees que es un error, contacta a{' '}
          <a
            href="mailto:legal@vendeya.pe"
            className="underline font-bold text-rose-300 hover:text-rose-200"
          >
            legal@vendeya.pe
          </a>{' '}
          para apelar. La revisión toma máximo 72h hábiles y tu cuenta sigue operativa mientras tanto.
        </p>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/* QUICK ACTIONS FOOTER                                               */
/* ================================================================== */
function QuickActionsFooter() {
  const actions: Array<{
    icon: React.ElementType
    label: string
    href: string
    accent: KpiAccent
  }> = [
    { icon: Tag,            label: 'Vender producto', href: ROUTES.vender,         accent: 'amber' },
    { icon: Gavel,          label: 'Crear subasta',   href: ROUTES.vender,         accent: 'rose' },
    { icon: MessageSquare,  label: 'Mensajes',         href: ROUTES.mensajes,       accent: 'sky' },
    { icon: Wallet,         label: 'Pagos',            href: ROUTES.pagos,          accent: 'lime' },
    { icon: Settings,       label: 'Configuración',    href: ROUTES.configuracion,  accent: 'fuchsia' },
    { icon: Heart,          label: 'Favoritos',        href: ROUTES.dashboard,      accent: 'purple' },
  ]

  return (
    <motion.section
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
      className="mt-5 md:mt-6 relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6"
    >
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-xl p-2 bg-muted border border-border">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">Acciones rápidas</h3>
            <p className="text-[11px] text-muted-foreground">Atajos a las tareas más comunes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {actions.map((a) => {
            const cfg = KPI_ACCENTS[a.accent]
            const Icon = a.icon
            return (
              <Link
                key={a.label}
                href={a.href}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-muted hover:bg-accent hover:border-border transition-all"
              >
                <div className="rounded-xl p-2 bg-muted border border-border group-hover:scale-110 transition-transform">
                  <Icon className={cn('h-5 w-5', cfg.text)} />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground text-center">{a.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <PushSubscribeButton className="w-full" />
        </div>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/* HOOK — useSellerDashboard                                          */
/* Same logic as prior version: fetches /api/seller/dashboard         */
/* every 30s, gracefully handles errors when wallet isn't registered.  */
/* ================================================================== */
function useSellerDashboard(sellerId: string) {
  const { authedFetch } = useAuth()
  const [data, setData] = React.useState<SellerDashboardData | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    const fetchData = async () => {
      try {
        const res = await authedFetch(
          `/api/seller/dashboard?sellerId=${encodeURIComponent(sellerId)}`,
        )
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
        const json = await res.json()
        if (active) {
          setData(json)
          setError(null)
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? (e instanceof Error ? e.message : String(e)) : 'Error desconocido')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [sellerId, authedFetch])

  return { data, error, isLoading }
}



function ReputationCard({ user, reviews }: { user: Profile; reviews: any[] }) {
  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-xl p-2 bg-muted border border-border">
          <Heart className="h-4 w-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Reputación</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-muted border border-border">
        <div className="text-4xl font-black text-foreground">{user?.rating?.toFixed(1) || '0.0'}</div>
        <div className="flex flex-col">
          <div className="flex text-amber-400 text-lg">
            {'★'.repeat(Math.round(user?.rating || 0))}{'☆'.repeat(5 - Math.round(user?.rating || 0))}
          </div>
          <span className="text-xs text-muted-foreground">{(user?.ratingsCount || 0)} calificaciones</span>
        </div>
      </div>

      <div className="space-y-3">
        {(!reviews || reviews.length === 0) ? (
          <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            Aún no tienes reseñas.
          </div>
        ) : reviews.map((r: any) => (
          <div key={r.id} className="p-3 rounded-xl bg-background border border-border text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-foreground">{r.reviewer?.displayName}</span>
              <span className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="text-muted-foreground text-xs">{r.comment}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
