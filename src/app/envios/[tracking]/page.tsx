'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck, Package, MapPin, CheckCircle2, Clock, Loader2, AlertCircle,
  ChevronRight, QrCode, Navigation, Phone, ExternalLink, Copy, Map,
} from 'lucide-react';
import { formatPEN } from '@/lib/vendeda/format';
import { SHIPPING_CARRIERS } from '@/lib/vendeda/constants';
import { ROUTES } from '@/lib/vendeda/routes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  GhostButton, GradientButton, StatusBadge,
} from '@/components/vendeda/StaticPageShell';

interface ShipmentData {
  shipment: {
    id: string;
    trackingCode: string | null;
    originAgencyId: string;
    destinationAgencyId: string;
    senderDni: string;
    receiverDni: string;
    shippingCost: number;
    shipmentStatus: string;
    pdfLabelUrl: string | null;
    createdAt: string;
    updatedAt: string;
    order: {
      id: string;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
    };
  };
}

type StepColor = 'amber' | 'sky' | 'lime' | 'rose';

const STATUS_STEPS: {
  key: string;
  label: string;
  icon: React.ElementType;
  color: StepColor;
}[] = [
  { key: 'pending_dropoff', label: 'Pedido confirmado', icon: CheckCircle2, color: 'amber' },
  { key: 'in_transit', label: 'En tránsito', icon: Truck, color: 'sky' },
  { key: 'ready_for_pickup', label: 'En agencia', icon: MapPin, color: 'sky' },
  { key: 'delivered', label: 'Entregado', icon: Package, color: 'lime' },
];

const DOT_BG: Record<StepColor, string> = {
  amber: 'bg-amber-400 border-amber-300/50 text-zinc-950',
  sky: 'bg-sky-400 border-sky-300/50 text-zinc-950',
  lime: 'bg-lime-400 border-lime-300/50 text-zinc-950',
  rose: 'bg-rose-400 border-rose-300/50 text-zinc-950',
};

const DOT_GLOW: Record<StepColor, string> = {
  amber: 'ring-amber-400/30',
  sky: 'ring-sky-400/30',
  lime: 'ring-lime-400/30',
  rose: 'ring-rose-400/30',
};

const STATUS_BADGE: Record<string, { variant: 'amber' | 'sky' | 'lime' | 'rose'; label: string }> = {
  pending_dropoff: { variant: 'amber', label: 'Pendiente' },
  in_transit: { variant: 'sky', label: 'En tránsito' },
  ready_for_pickup: { variant: 'sky', label: 'En agencia' },
  delivered: { variant: 'lime', label: 'Entregado' },
  problem: { variant: 'rose', label: 'Incidencia' },
};

const PAYMENT_BADGE: Record<string, { variant: 'amber' | 'sky' | 'lime' | 'rose' | 'zinc'; label: string }> = {
  released: { variant: 'lime', label: 'Liberado' },
  escrow_hold: { variant: 'amber', label: 'En escrow' },
  paid: { variant: 'sky', label: 'Pagado' },
  refunded: { variant: 'rose', label: 'Reembolsado' },
  pending: { variant: 'zinc', label: 'Pendiente' },
};

/** Infer carrier from tracking code prefix — Shalom by default. */
function inferCarrier(trackingCode: string | null) {
  const fallback = SHIPPING_CARRIERS[1] // Shalom by default
  if (!trackingCode) return fallback
  const code = trackingCode.toUpperCase()
  if (code.startsWith('OLV')) return SHIPPING_CARRIERS[0]
  if (code.startsWith('MRV')) return SHIPPING_CARRIERS[2]
  return fallback
}

/** Translate agency code like "LIM-01" to readable "Lima — Agencia 01". */
function agencyLabel(code: string): string {
  const known: Record<string, string> = {
    'LIM-01': 'Lima Centro — Agencia 01',
    'LIM-02': 'Lima Norte — Agencia 02',
    'LIM-03': 'Lima Sur — Agencia 03',
    'ARE-01': 'Arequipa — Agencia 01',
    'TRU-01': 'Trujillo — Agencia 01',
    'CUS-01': 'Cusco — Agencia 01',
  };
  return known[code] ?? code;
}

export default function TrackingPage() {
  const params = useParams<{ tracking: string }>();
  const trackingCode = decodeURIComponent(params.tracking);

  const { data, isLoading, error } = useShipmentTracking(trackingCode);

  const breadcrumbs = [
    { label: 'Envíos', href: ROUTES.envios },
    { label: trackingCode },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs md:text-sm text-zinc-500 mb-6 overflow-hidden">
          <Link href={ROUTES.home} className="hover:text-amber-400 transition-colors shrink-0">
            Inicio
          </Link>
          {breadcrumbs.map((bc, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="h-3 w-3 mx-1 shrink-0" />
              {bc.href ? (
                <Link href={bc.href} className="hover:text-amber-400 transition-colors truncate">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-white font-medium truncate font-mono">{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {isLoading ? (
          <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6">
            <div className="flex items-center gap-3 text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-black text-white">No se pudo cargar el envío</p>
                <p className="text-sm text-rose-300 mt-0.5">{error}</p>
              </div>
            </div>
            <Link href={ROUTES.envios}>
              <GhostButton className="mt-4 h-10 text-xs">
                <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Volver a envíos
              </GhostButton>
            </Link>
          </div>
        ) : data ? (
          <ShipmentView shipment={data.shipment} />
        ) : null}
      </div>
    </div>
  );
}

function ShipmentView({ shipment }: { shipment: ShipmentData['shipment'] }) {
  const { toast } = useToast();
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === shipment.shipmentStatus);
  // Treat unknown status as a "problem" (currentStepIndex === -1).
  const hasProblem = currentStepIndex === -1;
  const activeStepIndex = hasProblem ? 0 : currentStepIndex;

  const carrier = inferCarrier(shipment.trackingCode);
  const statusBadge = hasProblem
    ? STATUS_BADGE.problem
    : STATUS_STEPS[activeStepIndex]
      ? STATUS_BADGE[STATUS_STEPS[activeStepIndex].key]
      : STATUS_BADGE.problem;

  const createdAt = new Date(shipment.createdAt);
  const updatedAt = new Date(shipment.updatedAt);
  // Estimate delivery: createdAt + 3 days (mock ETA).
  const etaDate = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 3);
  const delivered = shipment.shipmentStatus === 'delivered';

  const handleCopyTracking = async () => {
    if (!shipment.trackingCode) return;
    try {
      await navigator.clipboard.writeText(shipment.trackingCode);
      toast({ title: '📋 Código copiado' });
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-5">
      {/* Big tracking number display */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-zinc-950 to-sky-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(14,165,233,0.15),transparent_50%)]" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-amber-400" /> Código de seguimiento {carrier.label}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="font-mono text-2xl md:text-3xl font-black text-white break-all leading-tight">
                  {shipment.trackingCode ?? '—'}
                </p>
                {shipment.trackingCode && (
                  <button
                    onClick={handleCopyTracking}
                    aria-label="Copiar código"
                    className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-colors shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <StatusBadge variant={statusBadge.variant}>
                  {statusBadge.label}
                </StatusBadge>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Actualizado {updatedAt.toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Carrier badge */}
            <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm p-3 shrink-0">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{ backgroundColor: carrier.color }}
              >
                {carrier.label.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{carrier.label}</p>
                <p className="text-[10px] text-zinc-500">{carrier.estDays}</p>
              </div>
            </div>
          </div>

          {shipment.pdfLabelUrl && (
            <a
              href={shipment.pdfLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ver guía PDF
            </a>
          )}
        </div>
      </motion.div>

      {/* Status timeline */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6">
        <h3 className="font-black text-white mb-5 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-amber-400" /> Estado del envío
        </h3>

        {/* Horizontal timeline (md+) */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            {STATUS_STEPS.map((step, i) => {
              const isDone = !hasProblem && i < currentStepIndex;
              const isCurrent = !hasProblem && i === currentStepIndex;
              const isFuture = !hasProblem && i > currentStepIndex;
              const isProblem = hasProblem;
              const Icon = step.icon;
              const color = isProblem ? 'rose' : isDone ? 'lime' : step.color;

              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-5 left-1/2 w-full h-0.5 -translate-y-0.5',
                        isFuture || isProblem ? 'bg-white/10' : 'bg-gradient-to-r from-amber-400 to-fuchsia-500'
                      )}
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                      isFuture
                        ? 'bg-zinc-900 border-white/10 text-zinc-600'
                        : `${DOT_BG[color]} ${isCurrent ? `ring-4 ${DOT_GLOW[color]}` : ''}`,
                      isProblem && 'ring-4 ring-rose-400/20'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-bold text-center max-w-[6rem] leading-tight',
                      isFuture ? 'text-zinc-600' : 'text-white'
                    )}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Actual
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {hasProblem && (
            <p className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Estado desconocido: <code className="font-mono">{shipment.shipmentStatus}</code>. Contacta al carrier.
            </p>
          )}
        </div>

        {/* Vertical timeline (mobile) */}
        <div className="md:hidden space-y-3">
          {STATUS_STEPS.map((step, i) => {
            const isDone = !hasProblem && i < currentStepIndex;
            const isCurrent = !hasProblem && i === currentStepIndex;
            const isFuture = !hasProblem && i > currentStepIndex;
            const isProblem = hasProblem;
            const Icon = step.icon;
            const color = isProblem ? 'rose' : isDone ? 'lime' : step.color;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                    isFuture
                      ? 'bg-zinc-900 border-white/10 text-zinc-600'
                      : `${DOT_BG[color]} ${isCurrent ? `ring-4 ${DOT_GLOW[color]}` : ''}`,
                    isProblem && 'ring-4 ring-rose-400/20'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold', isFuture ? 'text-zinc-600' : 'text-white')}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Actual · {updatedAt.toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                {isDone && <CheckCircle2 className="h-4 w-4 text-lime-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment details + QR */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6">
          <h3 className="font-black text-white mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-400" /> Detalles del envío
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Carrier</p>
              <p className="font-bold text-white mt-0.5 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: carrier.color }}
                />
                {carrier.label}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Costo de envío</p>
              <p className="font-bold text-amber-400 mt-0.5 tabular-nums">
                {formatPEN(shipment.shippingCost)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Origen</p>
              <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-400" /> {agencyLabel(shipment.originAgencyId)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Destino</p>
              <p className="font-bold text-white mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-sky-400" /> {agencyLabel(shipment.destinationAgencyId)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Pedido creado</p>
              <p className="font-bold text-white mt-0.5">
                {createdAt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Entrega estimada</p>
              <p className={`font-bold mt-0.5 ${delivered ? 'text-lime-400' : 'text-amber-400'}`}>
                {delivered
                  ? `Entregado · ${updatedAt.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}`
                  : etaDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <div className="col-span-2 mt-2 pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Orden de compra</p>
              <p className="font-mono text-xs text-amber-400 mt-0.5">#{shipment.order.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Contact carrier button */}
          <GradientButton
            onClick={() => toast({ title: '📞 Contactando carrier', description: carrier.label })}
            className="w-full h-11 mt-5"
          >
            <Phone className="h-4 w-4" /> Contactar a {carrier.label}
          </GradientButton>
        </div>

        {/* QR placeholder */}
        <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6 flex flex-col items-center justify-center">
          <h3 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-4 self-start flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 text-amber-400" /> Código QR
          </h3>
          {/* QR placeholder */}
          <div className="relative w-40 h-40 rounded-xl bg-white p-3 shadow-xl shadow-fuchsia-500/10">
            <div className="h-full w-full grid grid-cols-8 grid-rows-8 gap-0.5">
              {Array.from({ length: 64 }).map((_, i) => {
                // Pseudo-random QR pattern based on tracking code.
                const seed = (shipment.trackingCode ?? 'vendeya').charCodeAt(i % (shipment.trackingCode?.length ?? 7)) ?? 65
                const on = (seed * (i + 1)) % 3 === 0
                return <div key={i} className={on ? 'bg-zinc-950' : 'bg-white'} />
              })}
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4 text-center">
            Escanea para rastrear en tiempo real
          </p>
          <p className="text-[10px] text-zinc-600 mt-1 font-mono break-all text-center">
            {shipment.trackingCode ?? '—'}
          </p>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm overflow-hidden">
        <div className="relative aspect-[2/1] md:aspect-[3/1] bg-zinc-950">
          {/* Fake map grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden
          />
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <path
              d="M 30 70 Q 100 20, 150 50 T 270 30"
              fill="none"
              stroke="url(#route-grad)"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          </svg>
          {/* Origin pin */}
          <div className="absolute" style={{ left: '10%', top: '70%' }}>
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-amber-400 border-2 border-zinc-950 shadow-lg shadow-amber-500/50" />
              <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-400 whitespace-nowrap">
                Origen
              </p>
            </div>
          </div>
          {/* Destination pin */}
          <div className="absolute" style={{ right: '10%', top: '30%' }}>
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-fuchsia-500 border-2 border-zinc-950 shadow-lg shadow-fuchsia-500/50" />
              <p className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-fuchsia-400 whitespace-nowrap">
                Destino
              </p>
            </div>
          </div>
          {/* Moving truck marker (mock — at middle of route) */}
          {!delivered && !hasProblem && (
            <div
              className="absolute transition-all duration-500"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <div className="absolute inset-0 h-10 w-10 rounded-full bg-sky-400/30 blur-md animate-pulse" />
                <div className="relative h-8 w-8 rounded-full bg-sky-400 border-2 border-zinc-950 flex items-center justify-center shadow-lg shadow-sky-500/50">
                  <Truck className="h-3.5 w-3.5 text-zinc-950" />
                </div>
              </div>
            </div>
          )}
          {/* "Mapa en vivo" overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500" />
            </span>
            <Map className="h-3 w-3 text-lime-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Mapa en vivo</span>
          </div>
        </div>
      </div>

      {/* Estado de pago */}
      <div className="rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6">
        <h3 className="font-black text-white mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-amber-400" /> Estado del pago
        </h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Monto total</p>
            <p className="text-2xl font-black text-white tabular-nums">
              {formatPEN(shipment.order.totalAmount)}
            </p>
          </div>
          {(() => {
            const pb =
              PAYMENT_BADGE[shipment.order.paymentStatus] ?? {
                variant: 'zinc' as const,
                label: shipment.order.paymentStatus.replace('_', ' '),
              }
            return (
              <StatusBadge variant={pb.variant} className="text-xs px-3 py-1 capitalize">
                {pb.label}
              </StatusBadge>
            )
          })()}
        </div>
        {shipment.order.paymentStatus === 'escrow_hold' && (
          <p className="text-xs text-amber-300 mt-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            El pago está retenido en escrow hasta que se confirme la entrega del paquete.
          </p>
        )}
        {shipment.order.paymentStatus === 'released' && (
          <p className="text-xs text-lime-300 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ✓ Pago liberado al vendedor. ¡Gracias por tu compra!
          </p>
        )}
        {shipment.order.paymentStatus === 'paid' && (
          <p className="text-xs text-sky-300 mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Pago verificado · en proceso de liberación
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Hook con polling cada 30 segundos para tracking en tiempo real.
 */
function useShipmentTracking(trackingCode: string) {
  const [data, setData] = React.useState<ShipmentData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/shalom/shipments?tracking=${encodeURIComponent(trackingCode)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [trackingCode]);

  return { data, error, isLoading };
}
