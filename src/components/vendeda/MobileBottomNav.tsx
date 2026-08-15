'use client'

/**
 * MobileBottomNav — Barra inferior móvil (versión simplificada)
 * =====================================================================
 * 4 items únicamente:
 *   [Inicio]   [Tienda]   [＋ Vender]   [Perfil]
 *
 * - "En vivo" y "Alertas" se mueven al MobileTopActions (header móvil).
 * - El botón central de "Vender" es el CTA principal con degradado neón.
 * - Centrada con max-w-md mx-auto para evitar overflow en pantallas pequeñas.
 * - pb-safe para no pegarse al borde inferior de los iPhone con notch/Dynamic Island.
 * =====================================================================
 */
import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t } from '@/lib/vendeda/i18n'
import { ROUTES } from '@/lib/vendeda/routes'

type Tab = 'feed' | 'market' | 'create' | 'profile'

export function MobileBottomNav() {
  const pathname = usePathname()

  const items: { id: Tab; icon: React.ElementType; label: string; href: string }[] = [
    { id: 'feed',   icon: Home,        label: t('nav.feed'),   href: ROUTES.home },
    { id: 'market', icon: ShoppingBag, label: 'Tienda',         href: ROUTES.marketplace },
    { id: 'create', icon: Plus,        label: t('nav.create'), href: ROUTES.vender },
    { id: 'profile',icon: User,       label: t('nav.profile'), href: ROUTES.perfil },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/5 pb-safe"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto w-full max-w-md grid grid-cols-4 h-16">
        {items.map(({ id, icon: Icon, label, href }) => {
          const active = isActive(href)
          if (id === 'create') {
            return (
              <Link
                key={id}
                href={href}
                className="flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <div className={cn(
                  'h-11 w-11 rounded-full flex items-center justify-center -mt-5 shadow-lg shadow-fuchsia-500/40 transition-transform active:scale-95',
                  'bg-gradient-to-br from-amber-400 to-fuchsia-600 text-zinc-950'
                )}>
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <span className={cn(
                  'text-[10px] font-semibold -mt-0.5',
                  active ? 'text-amber-400' : 'text-zinc-400'
                )}>
                  {label}
                </span>
              </Link>
            )
          }
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5 active:scale-95 transition-transform"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                active ? 'text-amber-400' : 'text-zinc-400'
              )} />
              <span className={cn(
                'text-[10px] font-medium truncate w-full text-center',
                active ? 'text-amber-400' : 'text-zinc-400'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
