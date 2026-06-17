'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Radio, Plus, Bell, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t } from '@/lib/vendeda/i18n'
import { ROUTES } from '@/lib/vendeda/routes'

type Tab = 'feed' | 'live' | 'create' | 'notifications' | 'profile'

export function MobileBottomNav() {
  const pathname = usePathname()

  const items: { id: Tab; icon: React.ElementType; label: string; href: string }[] = [
    { id: 'feed',          icon: Home,  label: t('nav.feed'),         href: ROUTES.home },
    { id: 'live',          icon: Radio, label: t('nav.live'),         href: ROUTES.live },
    { id: 'create',        icon: Plus,  label: t('nav.create'),       href: ROUTES.vender },
    { id: 'notifications', icon: Bell,  label: t('nav.notifications'),href: ROUTES.notificaciones },
    { id: 'profile',       icon: User,  label: t('nav.profile'),      href: ROUTES.perfil },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t pb-safe"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map(({ id, icon: Icon, label, href }) => {
          const active = isActive(href)
          if (id === 'create') {
            return (
              <Link
                key={id}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center -mt-4 shadow-glow-salsa transition-transform active:scale-95',
                  'bg-salsa-500 text-white'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  'text-[10px] font-medium -mt-1',
                  active ? 'text-salsa-600' : 'text-muted-foreground'
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
              className="flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                active ? 'text-salsa-500' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-[10px] font-medium',
                active ? 'text-salsa-600' : 'text-muted-foreground'
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
