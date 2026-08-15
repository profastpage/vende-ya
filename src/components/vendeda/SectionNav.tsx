'use client'

/**
 * VENDE YA — SectionNav (sticky-top, estable, sin parpadeo)
 * =====================================================================
 * Cambios vs versión anterior:
 *   - Eliminado AnimatePresence + motion.nav (causaba flicker al
 *     mostrar/ocultar).
 *   - Eliminado backdrop-blur-xl (repaint constante al scrollear).
 *   - Hide-on-scroll ahora con transición CSS simple, no framer-motion.
 *   - Sticky debajo del MobileTopActions (top-14) y DesktopTopNav (md:top-16).
 * =====================================================================
 */
import * as React from 'react'
import {
  Radio, ShoppingBag, Sparkles, Users, Layout, ChevronUp,
} from 'lucide-react'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { cn } from '@/lib/utils'

export interface SectionDef {
  id: string
  label: string
  icon: React.ElementType
  shortLabel?: string
}

export const SECTIONS: SectionDef[] = [
  { id: 'hero',         label: 'Subasta en vivo', icon: Radio,        shortLabel: 'En vivo' },
  { id: 'sellers',      label: 'Vendedores top',  icon: Users,        shortLabel: 'Vendedores' },
  { id: 'live-rail',    label: 'Streams en vivo', icon: Radio,        shortLabel: 'Streams' },
  { id: 'auctions',     label: 'Subastas activas',icon: ShoppingBag,  shortLabel: 'Subastas' },
  { id: 'products',     label: 'Marketplace',     icon: Layout,       shortLabel: 'Productos' },
  { id: 'architecture', label: 'Arquitectura',    icon: Sparkles,     shortLabel: 'Tech' },
]

export function SectionNav() {
  const sectionIds = React.useMemo(() => SECTIONS.map((s) => s.id), [])
  const activeId = useScrollSpy(sectionIds, {
    rootMargin: '-30% 0px -60% 0px',
    updateHash: true,
    smoothScrollOnHash: true,
  })

  // Hide-on-scroll-down behavior (mobile UX) — usando CSS transition, no framer-motion
  const [hidden, setHidden] = React.useState(false)
  const lastScrollY = React.useRef(0)
  const tickingRef = React.useRef(false)

  React.useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY.current
        if (currentY > 200 && Math.abs(delta) > 8) {
          setHidden(delta > 0)
        }
        lastScrollY.current = currentY
        tickingRef.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    ;(window as any).__vendeyaMarkManualNav?.()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(window.history.state, '', `#${id}`)
    }
  }

  return (
    <nav
      className={cn(
        'sticky top-14 md:top-16 z-30 bg-zinc-950 border-b border-white/5 transition-transform duration-200 ease-out',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
      style={{ transform: 'translateZ(0)' }}
      aria-label="Navegación de secciones"
    >
      <div className="mx-auto w-full max-w-[1400px] px-2 md:px-6">
        <ul
          className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-2"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {SECTIONS.map((section) => {
            const isActive = activeId === section.id
            const Icon = section.icon
            return (
              <li key={section.id} style={{ listStyle: 'none' }} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleClick(e, section.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950'
                      : 'text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{section.shortLabel}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** Scroll-to-top button — appears after scrolling past the hero. */
export function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-4 bottom-24 md:bottom-8 z-30 h-10 w-10 rounded-full bg-zinc-900 border border-white/10 shadow-lg flex items-center justify-center hover:bg-zinc-800 transition-colors"
      aria-label="Volver al inicio"
    >
      <ChevronUp className="h-5 w-5 text-amber-400" />
    </button>
  )
}
