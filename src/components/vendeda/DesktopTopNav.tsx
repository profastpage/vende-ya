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
      className="hidden md:flex sticky top-0 z-40 h-16 items-center gap-4 px-6 bg-zinc-950/85 backdrop-blur-xl border-b border-white/5"
      role="banner"
    >
      {/* Logo */}
      <Link href={ROUTES.home} className="flex items-center gap-2 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <span className="text-white font-black text-lg">V</span>
        </div>
        <div className="leading-none">
          <div className="font-bold text-lg font-display tracking-tight text-white">{APP_NAME}</div>
          <div className="text-[10px] text-zinc-500 -mt-0.5">Subastas en vivo</div>
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
                active
                  ? 'bg-white/10 text-amber-400 border border-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="search"
          name="q"
          placeholder="Buscar productos, vendedores, marcas..."
          className="pl-10 h-10 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-amber-400/50"
          aria-label="Buscar"
        />
      </form>

      {/* Live indicator */}
      <Link
        href={ROUTES.live}
        className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-sm font-semibold">En vivo</span>
        <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0 font-bold">3</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link href={ROUTES.mensajes}>
          <Button variant="ghost" size="icon" aria-label="Mensajes" className="text-zinc-400 hover:text-white hover:bg-white/5">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
        <Link href={ROUTES.notificaciones} className="relative">
          <Button variant="ghost" size="icon" aria-label="Notificaciones" className="text-zinc-400 hover:text-white hover:bg-white/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400" />
          </Button>
        </Link>
        <Link href={ROUTES.vender}>
          <Button className="bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-black gap-1.5 h-10 shadow-lg shadow-fuchsia-500/30">
            <Plus className="h-4 w-4" /> Vender
          </Button>
        </Link>
        <Link href={ROUTES.dashboard}>
          <button className="flex items-center gap-1.5 pl-2 pr-3 h-10 rounded-lg hover:bg-white/5 transition-colors">
            <Avatar className="h-7 w-7 ring-2 ring-amber-400/30">
              <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Tu perfil" />
              <AvatarFallback>TÚ</AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>
        </Link>
      </div>
    </header>
  )
}
