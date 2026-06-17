'use client'

import * as React from 'react'
import { Search, Bell, MessageCircle, Radio, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'

export function DesktopTopNav() {
  const pathname = usePathname()

  const navLinks = [
    { href: ROUTES.home, label: 'Inicio' },
    { href: ROUTES.live, label: 'En vivo' },
    { href: ROUTES.marketplace, label: 'Marketplace' },
    { href: ROUTES.dashboard, label: 'Mi dashboard' },
  ]

  return (
    <header
      className="hidden md:flex sticky top-0 z-40 h-16 items-center gap-4 px-6 bg-card/80 backdrop-blur-lg border-b"
      role="banner"
    >
      {/* Logo */}
      <Link href={ROUTES.home} className="flex items-center gap-2 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center shadow-glow-salsa">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <div className="leading-none">
          <div className="font-bold text-lg font-display tracking-tight">{APP_NAME}</div>
          <div className="text-[10px] text-muted-foreground -mt-0.5">Subastas en vivo</div>
        </div>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-1" aria-label="Navegación principal">
        {navLinks.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-salsa-50 text-salsa-700' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Search */}
      <form
        action={ROUTES.search}
        className="flex-1 max-w-xl relative"
        role="search"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          placeholder="Buscar productos, vendedores, marcas..."
          className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1"
          aria-label="Buscar"
        />
      </form>

      {/* Live indicator */}
      <Link
        href={ROUTES.live}
        className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-salsa-50 hover:bg-salsa-100 text-salsa-700 transition-colors"
      >
        <span className="live-dot" />
        <span className="text-sm font-semibold">En vivo</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">3</Badge>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link href={ROUTES.mensajes}>
          <Button variant="ghost" size="icon" aria-label="Mensajes">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
        <Link href={ROUTES.notificaciones} className="relative">
          <Button variant="ghost" size="icon" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-salsa-500" />
          </Button>
        </Link>
        <Link href={ROUTES.vender}>
          <Button className="bg-salsa-500 hover:bg-salsa-600 text-white gap-1.5 h-10">
            <Plus className="h-4 w-4" /> Vender
          </Button>
        </Link>
        <Link href={ROUTES.dashboard}>
          <button className="flex items-center gap-1.5 pl-2 pr-3 h-10 rounded-lg hover:bg-muted transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Tu perfil" />
              <AvatarFallback>TÚ</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </Link>
      </div>
    </header>
  )
}
