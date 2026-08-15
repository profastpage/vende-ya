'use client'

/**
 * VENDE YA — SectionNav (Scroll Spy + Deep Linking UI)
 * =====================================================================
 * A floating pill nav that:
 *   - Shows the current section as active (from useScrollSpy)
 *   - Smooth-scrolls on click (and updates the URL hash)
 *   - Hides on scroll down, shows on scroll up (mobile-friendly)
 *   - Auto-generates from the SECTIONS config below
 *
 * To add a new section: just add it to SECTIONS and add an element
 * with `id={section.id}` somewhere in the page. Done.
 * =====================================================================
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio, ShoppingBag, Sparkles, Users, Layout, ChevronUp,
} from 'lucide-react'
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { cn } from '@/lib/utils'

export interface SectionDef {
  id: string
  label: string
  icon: React.ElementType
  /** Optional short label for the pill (mobile) */
  shortLabel?: string
}

// =====================================================================
// SECTION REGISTRY — edit this array to add/remove/reorder sections.
// Each `id` MUST match an element `id` somewhere in the page.
// =====================================================================
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

  // Hide-on-scroll-down behavior (mobile UX)
  const [hidden, setHidden] = React.useState(false)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      // Only hide after 100px of scrolling, and ignore small jitters
      if (currentY > 200 && Math.abs(delta) > 8) {
        setHidden(delta > 0) // hide on scroll down, show on scroll up
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    // Mark this as a manual nav so the scroll spy doesn't override the URL
    // for 800ms (while smooth scroll is animating)
    ;(window as any).__vendeyaMarkManualNav?.()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update URL hash without triggering hashchange (we already scrolled)
      window.history.pushState(window.history.state, '', `#${id}`)
      // Update active state immediately for snappy UX
      // (the scroll spy will confirm this once scroll settles)
    }
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          key="section-nav"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          // 🔧 Cambio clave: sticky-top (debajo del header móvil/desktop)
          // en vez de la píldora flotante bottom-center que se cortaba.
          // El navegador puede scrollear el contenido horizontalmente sin overflow.
          className="sticky top-14 md:top-16 z-30 bg-zinc-950/85 backdrop-blur-xl border-b border-white/5"
          aria-label="Navegación de secciones"
        >
          {/* max-w-md en mobile para centrar y limitar el ancho; full en desktop */}
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
                          ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 shadow-md shadow-fuchsia-500/30'
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
        </motion.nav>
      )}
    </AnimatePresence>
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
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-4 bottom-24 md:bottom-8 z-30 h-10 w-10 rounded-full bg-zinc-900 border border-white/10 shadow-lg flex items-center justify-center hover:bg-zinc-800 transition-colors"
      aria-label="Volver al inicio"
    >
      <ChevronUp className="h-5 w-5 text-amber-400" />
    </motion.button>
  )
}
