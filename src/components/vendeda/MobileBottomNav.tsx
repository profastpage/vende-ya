'use client'

/**
 * MobileBottomNav — Barra inferior móvil (4 items, integrada, sin FAB protruding)
 * =====================================================================
 *   [Inicio]   [Tienda]   [Vender]   [Perfil]
 *
 * Diseño:
 *   - Todos los ítems al mismo nivel (ninguno sobresale).
 *   - Cuando una subpage está activa, ese ítem tiene relieve NEÓN:
 *     glow shadow + color amber + fondo sutil + indicador superior.
 *   - El botón "Vender" usa degradado amber→fuchsia cuando está activo,
 *     pero respeta la misma altura que los demás.
 *   - h-16 (64px) + pb-safe para iPhone con notch.
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
    { id: 'market', icon: ShoppingBag, label: 'Tienda',        href: ROUTES.marketplace },
    { id: 'create', icon: Plus,        label: t('nav.create'), href: ROUTES.vender },
    { id: 'profile',icon: User,        label: t('nav.profile'),href: ROUTES.perfil },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950 border-t border-white/5 pb-safe"
      style={{ transform: 'translateZ(0)' }}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="mx-auto w-full max-w-md grid grid-cols-4 h-16">
        {items.map(({ id, icon: Icon, label, href }) => {
          const active = isActive(href)
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform',
                'flex-1 min-w-0'
              )}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Indicador superior con relieve neón cuando está activo */}
              {active && (
                <span
                  className="absolute top-0 h-[3px] w-8 rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-600"
                  style={{
                    boxShadow:
                      '0 0 12px rgba(245,158,11,0.7), 0 0 24px rgba(217,70,239,0.5)',
                  }}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'flex items-center justify-center transition-all',
                  active && id === 'create'
                    ? 'h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 text-zinc-950'
                    : active
                      ? 'h-9 w-9 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400'
                      : 'h-9 w-9 rounded-full text-zinc-400'
                )}
                style={
                  active
                    ? {
                        boxShadow:
                          id === 'create'
                            ? '0 0 16px rgba(245,158,11,0.55), 0 0 32px rgba(217,70,239,0.4)'
                            : '0 0 12px rgba(245,158,11,0.5)',
                      }
                    : undefined
                }
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold truncate w-full text-center',
                  active ? 'text-amber-400' : 'text-zinc-400'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
