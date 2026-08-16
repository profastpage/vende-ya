'use client'

/**
 * VENDE YA — SectionNav (sticky-top, estable, sin parpadeo)
 * =====================================================================
 * v3 — Sin hide-on-scroll (era la fuente principal del parpadeo).
 *   - Tokens semánticos (light/dark).
 *   - Sin backdrop-blur (evita repaints constantes).
 *   - `translateZ(0)` + `willChange: transform` para capa GPU estable.
 *   - Scroll-spy usa IntersectionObserver (no scroll listener).
 *   - Siempre visible — no parpadea al hacer scroll.
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

  // NOTA: hide-on-scroll eliminado — era la causa del parpadeo.
  // El header queda siempre visible (sticky), más estable y predecible.

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
      className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border"
      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
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
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors pointer-events-auto',
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950'
                      : 'text-muted-foreground bg-muted border border-border hover:bg-accent hover:text-foreground'
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
      className="fixed right-4 bottom-24 md:bottom-8 z-30 h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
      aria-label="Volver al inicio"
    >
      <ChevronUp className="h-5 w-5 text-amber-500" />
    </button>
  )
}
