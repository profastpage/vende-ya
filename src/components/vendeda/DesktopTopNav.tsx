'use client'

import * as React from 'react'
import { Search, Bell, MessageCircle, Radio, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'

import { useAuth } from './AuthProvider'

export function DesktopTopNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const navLinks = [
    { href: ROUTES.home, label: 'Inicio' },
    { href: ROUTES.live, label: 'En vivo' },
    { href: ROUTES.marketplace, label: 'Marketplace' },
    { href: ROUTES.dashboard, label: 'Mi dashboard' },
  ]

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [isVisible, setIsVisible] = React.useState(true)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    // Only auto-hide on Marketplace (when not on '/')
    if (pathname === '/') return 
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true)  // Scrolling up
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  return (
    <header
      className={cn(
        "hidden md:flex fixed top-0 inset-x-0 z-40 h-16 items-center gap-4 px-6 transition-all duration-300 bg-background border-b border-border text-foreground",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
      role="banner"
    >
      {/* Logo — imagen oficial /logo.png */}
      <Link href={ROUTES.home} className="flex items-center gap-2 shrink-0" aria-label={APP_NAME}>
        <Image
          src="/logo.png"
          alt={`${APP_NAME} — Subastas en vivo del Perú`}
          width={36}
          height={36}
          priority
          className="rounded-lg shadow-lg shadow-fuchsia-500/30 object-contain"
        />
        <div className="leading-none">
          <div className="font-bold text-lg font-display tracking-tight text-foreground">{APP_NAME}</div>
          <div className="text-[10px] -mt-0.5 text-muted-foreground">Subastas en vivo</div>
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
                  ? 'bg-accent text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          name="q"
          placeholder="Buscar productos, vendedores, marcas..."
          className="pl-10 h-10 bg-muted border border-border text-foreground placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
          aria-label="Buscar"
        />
      </form>

      {/* Live indicator */}
      <Link
        href={ROUTES.live}
        className="flex items-center gap-1.5 px-3 h-10 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
        <span className="text-sm font-semibold">En vivo</span>
        <span className="text-[10px] bg-rose-600 text-white rounded-full px-1.5 py-0 font-bold">3</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — visible en desktop (PC) al lado de las acciones */}
        <ThemeToggle />
        <Link href={ROUTES.mensajes}>
          <Button variant="ghost" size="icon" aria-label="Mensajes" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
        <Link href={ROUTES.notificaciones} className="relative">
          <Button variant="ghost" size="icon" aria-label="Notificaciones" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
          </Button>
        </Link>
        <Link href={ROUTES.vender}>
          <Button className="bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-black gap-1.5 h-10 shadow-lg shadow-fuchsia-500/30">
            <Plus className="h-4 w-4" /> Vender
          </Button>
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 pl-2 pr-3 h-10 rounded-lg hover:bg-accent text-gray-700 hover:text-foreground transition-colors focus:outline-none"
            aria-expanded={open}
            aria-haspopup="true"
            title={user?.displayName || "Tu perfil"}
          >
            <Avatar className="h-7 w-7 ring-2 ring-gray-200">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              ) : (
                <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Tu perfil" />
              )}
              <AvatarFallback className="bg-accent text-gray-800">{user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'TÚ'}</AvatarFallback>
            </Avatar>
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-background p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-1 duration-100">
              <div className="px-3 py-2 border-b border-gray-100 mb-1.5">
                <p className="text-xs font-bold text-foreground truncate">{user?.displayName || 'Usuario'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'sin correo'}</p>
              </div>
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="flex w-full items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Mi Perfil / Mis Datos
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex w-full items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Mi Dashboard
              </Link>
              <Link
                href="/subastas"
                onClick={() => setOpen(false)}
                className="flex w-full items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Historial de Subastas
              </Link>
              <Link
                href="/configuracion"
                onClick={() => setOpen(false)}
                className="flex w-full items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Configuración de Cuenta
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={async () => {
                  setOpen(false)
                  await signOut()
                  window.location.href = '/login'
                }}
                className="flex w-full items-center px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
