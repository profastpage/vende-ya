'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Radio, Eye, BadgeCheck, Flame, Play, ArrowRight, Sparkles,
} from 'lucide-react'
import { MOCK_STREAMS, MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { formatViewers } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import type { LiveStream, Profile } from '@/lib/vendeda/types'

/* ------------------------------------------------------------------ */
/* Dark Stream Hub — /en-vivo index · "Ultra Inmersiva"               */
/* Pure dark (bg-zinc-950) · glassmorphism · neon accents · bento     */
/* Twitch-style browse page for live shopping streams.                */
/* ------------------------------------------------------------------ */

type FilterKey = 'all' | 'live' | 'upcoming' | 'moda' | 'tech' | 'hogar'

interface FilterDef {
  key: FilterKey
  label: string
  accent?: 'live' | 'default'
}

const FILTERS: FilterDef[] = [
  { key: 'all',      label: 'Todo' },
  { key: 'live',     label: 'En vivo',  accent: 'live' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'moda',     label: 'Moda' },
  { key: 'tech',     label: 'Tech' },
  { key: 'hogar',    label: 'Hogar' },
]

const AVATAR_GRADIENTS = [
  'from-amber-400 to-fuchsia-500',
  'from-sky-400 to-purple-500',
  'from-lime-400 to-emerald-500',
  'from-rose-400 to-amber-500',
  'from-fuchsia-400 to-purple-500',
  'from-cyan-400 to-blue-500',
]

function avatarGradient(seed: string): string {
  const digits = seed.replace(/\D/g, '')
  const n = digits ? parseInt(digits, 10) : 0
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length]
}

/** Mock category bucket — derived from stream ID mod 3 for demo filtering. */
function streamBucket(s: { id: string }): 'moda' | 'tech' | 'hogar' {
  const digits = s.id.replace(/\D/g, '')
  const n = digits ? parseInt(digits, 10) : 0
  const m = n % 3
  return m === 1 ? 'moda' : m === 2 ? 'tech' : 'hogar'
}

function bucketLabel(b: 'moda' | 'tech' | 'hogar'): string {
  return b === 'moda' ? 'Moda' : b === 'tech' ? 'Tech' : 'Hogar'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/* ────────────────────────────────────────────────────────────────── */
/* Featured hero card — large, glassmorphism, big CTA                 */
/* ────────────────────────────────────────────────────────────────── */
function FeaturedHeroCard({ stream }: { stream: LiveStream }) {
  const seller: Profile = stream.seller ?? MOCK_PROFILES[0]
  const bucket = streamBucket(stream)

  return (
    <Link href={ROUTES.stream(stream.id)} className="block group" aria-label={`Unirse a ${stream.title}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${stream.thumbnailUrl ?? ''})` }}
          aria-hidden
        />

        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

        {/* LIVE badge — top-left */}
        {stream.isLive && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-500/90 backdrop-blur-md border border-rose-300/30 rounded-full pl-2.5 pr-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-white animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              En vivo
            </span>
          </div>
        )}

        {/* Viewers pill — top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
          <Eye className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-white tabular-nums">
            {stream.viewerCount}
          </span>
        </div>

        {/* Glass content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="max-w-2xl">
            {/* Category tag + viewers count */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                {bucketLabel(bucket)}
              </span>
              <span className="text-white/30" aria-hidden>·</span>
              <span className="text-[10px] font-medium text-zinc-300">
                {formatViewers(stream.viewerCount)}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg line-clamp-2 mb-3">
              {stream.title}
            </h2>

            {/* Description — desktop only for depth */}
            {stream.description && (
              <p className="hidden md:block text-sm text-zinc-300 line-clamp-2 mb-4 max-w-xl leading-relaxed">
                {stream.description}
              </p>
            )}

            {/* Seller chip */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient(seller.id)} flex items-center justify-center font-black text-zinc-950 text-xs border border-white/20`}
                aria-hidden
              >
                {seller.displayName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-white">
                {seller.displayName}
              </span>
              {seller.isVerified && (
                <BadgeCheck className="h-4 w-4 text-sky-400" aria-label="Vendedor verificado" />
              )}
              {seller.department && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  · {seller.department}
                </span>
              )}
            </div>

            {/* CTA — gradient amber → fuchsia */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-fuchsia-500 text-zinc-950 font-black text-sm px-5 py-3 rounded-full shadow-lg shadow-fuchsia-500/30 group-hover:scale-[1.02] transition-transform">
              <Play className="h-4 w-4 fill-zinc-950" />
              Unirse al en vivo
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Filter chip                                                        */
/* ────────────────────────────────────────────────────────────────── */
function FilterChip({
  active, label, accent, onClick,
}: {
  active: boolean
  label: string
  accent?: 'live' | 'default'
  onClick: () => void
}) {
  const base =
    'shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border transition-all'
  const activeCls =
    accent === 'live'
      ? 'bg-rose-500 text-zinc-950 border-rose-500 shadow-lg shadow-rose-500/30'
      : 'bg-amber-400 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
  const inactive =
    accent === 'live'
      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'

  return (
    <button
      onClick={onClick}
      className={`${base} ${active ? activeCls : inactive}`}
      aria-pressed={active}
    >
      {accent === 'live' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
        </span>
      )}
      {label}
    </button>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Stream card — 3:4 aspect, image-first                              */
/* ────────────────────────────────────────────────────────────────── */
function StreamCard({ stream }: { stream: LiveStream }) {
  const seller: Profile = stream.seller ?? MOCK_PROFILES[0]
  const bucket = streamBucket(stream)

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
      <Link href={ROUTES.stream(stream.id)} className="group block h-full" aria-label={`Ver ${stream.title}`}>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shadow-lg shadow-black/40">
          {/* Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${stream.thumbnailUrl ?? ''})` }}
            aria-hidden
          />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* LIVE / Próximo badge — top-left */}
          {stream.isLive ? (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-rose-500/90 backdrop-blur-md border border-rose-300/30 rounded-full pl-2 pr-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-white">
                Live
              </span>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full px-2 py-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                Próximo
              </span>
            </div>
          )}

          {/* Viewers pill — top-right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2 py-1">
            <Eye className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-white tabular-nums">
              {stream.viewerCount}
            </span>
          </div>

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-1.5">
              {bucketLabel(bucket)}
            </p>
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-2">
              {stream.title}
            </h3>
            <div className="flex items-center gap-1.5">
              <div
                className={`h-5 w-5 rounded-full bg-gradient-to-br ${avatarGradient(seller.id)} flex items-center justify-center font-black text-[9px] text-zinc-950 border border-white/20`}
                aria-hidden
              >
                {seller.displayName.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold text-zinc-200 truncate">
                {seller.displayName}
              </span>
              {seller.isVerified && (
                <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" aria-label="Vendedor verificado" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/* Empty state — when filter yields no streams                       */
/* ────────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 md:p-12 text-center"
    >
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center">
        <Radio className="h-7 w-7 text-zinc-500" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-white mb-1">
        No hay transmisiones en esta categoría ahora
      </h3>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
        Estamos preparando nuevas transmisiones en vivo para ti. Mientras tanto,
        explora el marketplace y descubre productos de vendedores verificados en
        todo el Perú. Las próximas subastas se anuncian con horas de anticipación.
      </p>
      <Link
        href={ROUTES.marketplace}
        className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-zinc-950 px-5 py-2.5 text-sm font-bold hover:bg-amber-300 transition-colors"
      >
        Explorar marketplace
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════ */
/* PAGE                                                                */
/* ════════════════════════════════════════════════════════════════ */
export default function LivePage() {
  const [filter, setFilter] = React.useState<FilterKey>('all')

  const liveStreams = React.useMemo(
    () => MOCK_STREAMS.filter((s) => s.isLive),
    [],
  )
  const featured = liveStreams[0] ?? MOCK_STREAMS[0]

  const filtered = React.useMemo(() => {
    return MOCK_STREAMS.filter((s) => {
      if (filter === 'live' && !s.isLive) return false
      if (filter === 'upcoming' && s.isLive) return false
      if (filter === 'moda' && streamBucket(s) !== 'moda') return false
      if (filter === 'tech' && streamBucket(s) !== 'tech') return false
      if (filter === 'hogar' && streamBucket(s) !== 'hogar') return false
      return true
    })
  }, [filter])

  const totalLive = liveStreams.length
  const totalViewers = liveStreams.reduce((sum, s) => sum + s.viewerCount, 0)

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 dark">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-24 md:pb-16">
        {/* ────────────────────────────────────────────────────────
            HERO — Transmisiones destacadas
            ──────────────────────────────────────────────────────── */}
        <section className="mb-8 md:mb-12" aria-label="Transmisión destacada">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-amber-400" aria-hidden />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Transmisiones destacadas
            </span>
          </div>

          {featured && <FeaturedHeroCard stream={featured} />}
        </section>

        {/* ────────────────────────────────────────────────────────
            HEADER — En vivo ahora + count
            ──────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-rose-400" aria-hidden />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display">
                En vivo ahora
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
              <span className="text-amber-400 font-bold">{totalLive}</span>{' '}
              transmisiones ·{' '}
              <span className="text-amber-400 font-bold">{formatViewers(totalViewers)}</span>{' '}
              conectados ahora mismo. Subastas relámpago en directo, vendedores
              verificados y ofertas que solo duran minutos. Únete, puja y paga con
              Yape o Plin sin salir de la transmisión.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href={ROUTES.marketplace}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Explorar marketplace
            </Link>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────
            FILTROS — chips horizontales (scroll en móvil)
            ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
          role="tablist"
          aria-label="Filtrar transmisiones"
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              active={filter === f.key}
              label={f.label}
              accent={f.accent}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>

        {/* ────────────────────────────────────────────────────────
            REJILLA DE STREAMS
            ──────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
          >
            {filtered.map((s) => (
              <StreamCard key={s.id} stream={s} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
