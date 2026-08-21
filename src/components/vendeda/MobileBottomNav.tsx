'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Plus, User, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const items = [
    { id: 'feed',        icon: Home,         label: 'Inicio',       href: '/' },
    { id: 'marketplace', icon: ShoppingBag,  label: 'Mercado',      href: '/marketplace' },
    { id: 'vender',      icon: Plus,         label: 'Vender',       href: '/vender' },
    { id: 'mensajes',    icon: MessageCircle,label: 'Mensajes',     href: '/mensajes' },
    { id: 'perfil',      icon: User,         label: 'Perfil',       href: '/perfil' },
  ]

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border flex justify-around items-center pb-safe pt-2 transition-colors duration-200">
      <div className="w-full flex items-center justify-around h-16 px-1">
        {items.map(({ id, icon: Icon, label, href }) => {
          const active = isActive(href)
          const isCenter = id === 'vender'
          
          if (isCenter) {
            return (
              <Link key={id} href={href} className="transform -translate-y-4">
                <div className="bg-primary text-primary-foreground rounded-full p-3.5 shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 active:scale-95 transition-all w-16",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
