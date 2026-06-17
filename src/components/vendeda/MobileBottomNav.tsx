'use client'

import * as React from 'react'
import Link from 'next/link'
import { Home, Radio, Plus, Bell, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t } from '@/lib/vendeda/i18n'

type Tab = 'feed' | 'live' | 'create' | 'notifications' | 'profile'

export function MobileBottomNav({
  active, onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  const items: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'feed', icon: Home, label: t('nav.feed') },
    { id: 'live', icon: Radio, label: t('nav.live') },
    { id: 'create', icon: Plus, label: t('nav.create') },
    { id: 'notifications', icon: Bell, label: t('nav.notifications') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t pb-safe"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map(({ id, icon: Icon, label }) => {
          const isActive = id === active
          if (id === 'create') {
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex flex-col items-center justify-center gap-0.5"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center -mt-4 shadow-glow-salsa transition-transform active:scale-95',
                  'bg-salsa-500 text-white'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  'text-[10px] font-medium -mt-1',
                  isActive ? 'text-salsa-600' : 'text-muted-foreground'
                )}>
                  {label}
                </span>
              </button>
            )
          }
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-salsa-500' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-salsa-600' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
