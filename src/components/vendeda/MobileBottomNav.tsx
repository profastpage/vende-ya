'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const items = [
    { id: 'feed',        icon: Home,         label: 'Inicio',       href: '/' },
    { id: 'marketplace', icon: ShoppingBag,  label: 'Marketplace',  href: '/marketplace' },
    { id: 'vender',      icon: Plus,         label: 'Vender',       href: '/vender' },
    { id: 'perfil',      icon: User,         label: 'Perfil',       href: '/perfil' },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Detect if we are in social/feed view (dark mode)
  const isSocialView = pathname === '/'

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-50 border-t pb-safe transition-colors",
        isSocialView ? "bg-black/80 backdrop-blur-md border-white/10" : "bg-background/95 backdrop-blur-md border-border"
      )}
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
    >
      <div className="mx-auto w-full max-w-md flex items-center justify-around h-16 px-2">
        {items.map(({ id, icon: Icon, label, href }) => {
          const active = isActive(href)
          const isCenter = id === 'vender'
          
          return (
            <Link
              key={id}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform flex-1"
            >
              <div
                className={cn(
                  'flex items-center justify-center transition-all',
                  isCenter 
                    ? 'h-10 w-10 rounded-full bg-[#FE2C55] text-white shadow-lg' 
                    : 'h-8 w-8',
                  !isCenter && active 
                    ? isSocialView ? 'text-white' : 'text-foreground' 
                    : !isCenter ? 'text-gray-400' : ''
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active || isCenter ? 2.5 : 2} />
              </div>
              {!isCenter && (
                <span
                  className={cn(
                    'text-[10px] font-semibold truncate text-center',
                    active 
                      ? isSocialView ? 'text-white' : 'text-foreground' 
                      : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
