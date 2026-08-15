'use client'

/**
 * MobileTopActions — Header móvil ESTABLE (sin parpadeo)
 * =====================================================================
 * Cambios vs versión anterior:
 *   - Eliminado `backdrop-blur-xl` (causa repaints constantes al scrollear).
 *   - Eliminado `animate-ping` (animación GPU infinita que parpadea).
 *   - Background sólido `bg-zinc-950` (no translúcido) para estabilidad.
 *   - `transform: translateZ(0)` para forzar capa GPU sin animar.
 *   - El "En vivo" sigue con un punto rojo estático (no animado) + badge.
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

export function MobileTopActions() {
  const pathname = usePathname()
  const liveActive = pathname.startsWith('/en-vivo')
  const notifActive = pathname.startsWith('/notificaciones')

  // En una versión real vendría de useAuth/useNotifications. Mock estable.
  const liveCount = 3
  const unreadCount = 5

  return (
    <header
      className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-3 bg-zinc-950 border-b border-white/5"
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      role="banner"
    >
      {/* === Izquierda: En vivo === */}
      <Link
        href={ROUTES.live}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
          liveActive
            ? 'bg-rose-500/15 border border-rose-400/40 text-rose-300'
            : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
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

      {/* === Derecha: Alertas === */}
      <Link
        href={ROUTES.notificaciones}
        className={cn(
          'relative flex items-center justify-center h-9 w-9 rounded-full transition-colors',
          notifActive
            ? 'bg-amber-500/15 border border-amber-400/40 text-amber-300'
            : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
        )}
        aria-label="Ver notificaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center border-2 border-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  )
}
