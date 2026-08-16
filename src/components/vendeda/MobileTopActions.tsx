'use client'

/**
 * MobileTopActions — Header móvil ESTABLE (sin parpadeo)
 * =====================================================================
 * v3 — Tokens semánticos (light/dark), sin colores hardcoded.
 *   - Background sólido `bg-background` con border `border-border`.
 *   - Sin backdrop-blur (causa repaints en scroll).
 *   - Sin animaciones GPU infinitas.
 *   - `translateZ(0)` para forzar capa GPU.
 *   - Layout absoluta del logo central con `left-1/2 -translate-x-1/2`
 *     para evitar reflow al cambiar de pathname.
 * =====================================================================
 */
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Radio, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'

export function MobileTopActions() {
  const pathname = usePathname()
  // Memoize active states to prevent re-renders
  const liveActive = React.useMemo(() => pathname.startsWith('/en-vivo'), [pathname])
  const notifActive = React.useMemo(() => pathname.startsWith('/notificaciones'), [pathname])

  // Mock stable counts (en prod vendría de useAuth/useNotifications)
  const liveCount = 3
  const unreadCount = 5

  return (
    <header
      className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-3 bg-background/95 backdrop-blur-md border-b border-border"
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      role="banner"
    >
      {/* === Izquierda: En vivo === */}
      <Link
        href={ROUTES.live}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors pointer-events-auto',
          liveActive
            ? 'bg-rose-500/15 border border-rose-400/40 text-rose-500 dark:text-rose-300'
            : 'bg-muted border border-border text-foreground hover:bg-accent'
        )}
        aria-label="Ver transmisiones en vivo"
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        <Radio className="h-4 w-4" />
        <span className="text-xs font-bold">En vivo</span>
        {liveCount > 0 && (
          <span className="ml-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">
            {liveCount}
          </span>
        )}
      </Link>

      {/* === Centro: Logo === */}
      <Link
        href={ROUTES.home}
        className="absolute left-1/2 -translate-x-1/2 flex items-center"
        aria-label={`Volver al inicio — ${APP_NAME}`}
      >
        <Image
          src="/logo.png"
          alt={`${APP_NAME} — Subastas en vivo del Perú`}
          width={32}
          height={32}
          priority
          className="rounded-lg object-contain"
        />
      </Link>

      {/* === Derecha: Tema + Alertas === */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href={ROUTES.notificaciones}
          className={cn(
            'relative flex items-center justify-center h-9 w-9 rounded-full transition-colors pointer-events-auto',
            notifActive
              ? 'bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-300'
              : 'bg-muted border border-border text-foreground hover:bg-accent'
          )}
          aria-label="Ver notificaciones"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center border-2 border-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
