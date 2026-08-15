'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { QuickAuctionFab } from '@/components/vendeda/QuickAuctionFab'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

/**
 * StaticPageShell — Dark premium page wrapper for the secondary static pages.
 *
 * Renders the page chrome (mobile compact header, desktop breadcrumb bar,
 * QuickAuctionFab) WITHOUT re-rendering DesktopTopNav / MobileBottomNav,
 * which now live at the layout level (see src/app/layout.tsx).
 *
 * Visual language mirrors the Ultra Inmersiva homepage:
 *   - bg-zinc-950 pure dark surface
 *   - amber-400 -> fuchsia-600 gradient accents
 *   - white/5 + white/10 borders
 *   - backdrop-blur-xl on overlays
 */

export interface Breadcrumb {
  label: string
  href?: string
}

export interface StaticPageShellProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: Breadcrumb[]
  showBack?: boolean
  backHref?: string
  maxWidth?: string
  /** When provided, renders a centered gradient hero header on desktop. */
  pageHeader?: React.ReactNode
}

export function StaticPageShell({
  children,
  title,
  breadcrumbs,
  showBack = true,
  backHref = ROUTES.home,
  maxWidth = 'max-w-3xl',
  pageHeader,
}: StaticPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <Link href={backHref} aria-label="Volver" className="p-2 -ml-2">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="text-base font-bold font-display truncate text-white">
                {title ?? APP_NAME}
              </h1>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="text-[10px] text-zinc-500 truncate">
                  {breadcrumbs.map((bc, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <ChevronRight className="inline h-2 w-2 mx-0.5" />}
                      {bc.href ? (
                        <Link href={bc.href} className="hover:text-amber-400">
                          {bc.label}
                        </Link>
                      ) : (
                        <span>{bc.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link href={ROUTES.home} className="flex items-center gap-2 shrink-0" aria-label={APP_NAME}>
            <Image
              src="/logo.png"
              alt={`${APP_NAME} — Subastas en vivo del Perú`}
              width={32}
              height={32}
              priority
              className="rounded-lg shadow-lg shadow-fuchsia-500/30 object-contain"
            />
          </Link>
        </div>
      </header>

      {/* Desktop breadcrumb bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden md:block border-b border-white/5 bg-zinc-950">
          <div className={`mx-auto ${maxWidth} px-6 py-3 flex items-center gap-1 text-sm text-zinc-500`}>
            <Link href={ROUTES.home} className="hover:text-amber-400 transition-colors">
              Inicio
            </Link>
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="h-3 w-3 mx-1" />
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-amber-400 transition-colors">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-white font-medium">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <main className={`flex-1 w-full ${maxWidth} mx-auto px-4 md:px-6 py-4 md:py-10 pb-24 md:pb-16`}>
        {pageHeader && <div className="mb-8 md:mb-10">{pageHeader}</div>}
        {children}
      </main>

      <QuickAuctionFab />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PageHeader — centered gradient hero header (dark premium)            */
/* ------------------------------------------------------------------ */

export interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ElementType
  iconAccent?: string // tailwind text-* color, defaults to amber-400
  glow?: string // tailwind bg-* color for the radial glow, defaults to fuchsia
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconAccent = 'text-amber-400',
  glow = 'bg-fuchsia-500',
}: PageHeaderProps) {
  return (
    <div className="relative text-center max-w-3xl mx-auto">
      {/* Ambient glow */}
      <div
        className={`absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-72 rounded-full ${glow} opacity-20 blur-3xl pointer-events-none`}
        aria-hidden
      />
      {Icon && (
        <div className="relative mb-4 inline-flex">
          <div className="h-14 w-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Icon className={`h-7 w-7 ${iconAccent}`} />
          </div>
        </div>
      )}
      <h1 className="relative text-3xl md:text-5xl font-black font-display tracking-tight leading-tight">
        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-fuchsia-500 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      {subtitle && (
        <p className="relative mt-4 text-zinc-400 text-sm md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reusable atoms — dark premium variants of common UI patterns        */
/* ------------------------------------------------------------------ */

/** Dark premium card: bg-zinc-900/80, white/5 border, backdrop blur. */
export function DarkCard({
  className = '',
  children,
  as: Tag = 'div',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType }) {
  return (
    <Tag
      className={`relative rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Glassmorphism card: bg-white/5 + backdrop-blur-xl + border-white/10. */
export function GlassCard({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

/** Primary CTA button — amber -> fuchsia gradient with neon glow shadow. */
export function GradientButton({
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 h-12
                  bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black
                  shadow-lg shadow-fuchsia-500/30 transition-transform
                  hover:scale-[1.02] active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Secondary button — subtle glass surface. */
export function GhostButton({
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11
                  bg-white/5 border border-white/10 hover:bg-white/10
                  text-white font-semibold transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Dark input — translucent background, focus-visible ring amber. */
export function DarkInput({
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-11 px-4 rounded-xl
                  bg-white/5 border border-white/10 text-white
                  placeholder:text-zinc-500
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
                  focus-visible:border-amber-400/50
                  transition-colors ${className}`}
      {...rest}
    />
  )
}

/** Dark textarea — same styling language as DarkInput. */
export function DarkTextarea({
  className = '',
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10 text-white
                  placeholder:text-zinc-500
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
                  focus-visible:border-amber-400/50
                  transition-colors resize-y ${className}`}
      {...rest}
    />
  )
}

/** Dark select — same styling language as DarkInput. */
export function DarkSelect({
  className = '',
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full h-11 px-4 rounded-xl appearance-none
                  bg-white/5 border border-white/10 text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
                  focus-visible:border-amber-400/50
                  transition-colors ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

/** Field label. */
export function DarkLabel({
  className = '',
  children,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ${className}`}
      {...rest}
    >
      {children}
    </label>
  )
}

/** Status badge — lime/amber/rose/sky variants. */
const BADGE_VARIANTS = {
  lime:   'bg-lime-500/15 text-lime-400 border-lime-500/30',
  amber:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rose:   'bg-rose-500/15 text-rose-400 border-rose-500/30',
  sky:    'bg-sky-500/15 text-sky-400 border-sky-500/30',
  fuchsia:'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
  zinc:   'bg-white/5 text-zinc-400 border-white/10',
} as const

export type BadgeVariant = keyof typeof BADGE_VARIANTS

export function StatusBadge({
  variant = 'zinc',
  className = '',
  children,
}: {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${BADGE_VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

/** Toggle switch — dark premium styled Radix-free implementation. */
export function DarkToggle({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors
                  ${checked
                    ? 'bg-gradient-to-r from-amber-400 to-fuchsia-500 border-amber-400/50'
                    : 'bg-white/5 border-white/10'
                  }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md transition-all
                    ${checked ? 'left-[1.375rem]' : 'left-0.5'}`}
      />
    </button>
  )
}

/** Framer Motion stagger container variants. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

/** Ambient page background glow — decorative blurred gradient blobs. */
export function AmbientGlow({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
    </div>
  )
}
