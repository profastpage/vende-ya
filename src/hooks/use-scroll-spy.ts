'use client'

/**
 * VENDE YA — useScrollSpy Hook
 * =====================================================================
 * Tracks the section currently in view using IntersectionObserver.
 * Updates the URL hash via History API (no page reload) so users can:
 *   - Share deep links to any section (e.g. /#marketplace)
 *   - Use browser back/forward to navigate between sections
 *   - See the current section reflected in the address bar
 *
 * Features:
 *   - Smooth scroll to section on hash change (click nav or back/fwd)
 *   - Active section exposed for nav highlighting
 *   - Configurable root margin (when to consider a section "active")
 *   - Auto-rebinds when section list changes
 *   - SSR-safe (no window access during render)
 *   - Respects prefers-reduced-motion for accessibility
 *
 * Usage:
 *   const active = useScrollSpy(['hero', 'live', 'marketplace', 'footer'])
 *   // active === 'live' when #live is in view
 * =====================================================================
 */
import * as React from 'react'

export interface ScrollSpyOptions {
  /** Pixel offset from top of viewport to consider a section "active". */
  rootMargin?: string
  /** Threshold ratio (0..1) for intersection. */
  threshold?: number | number[]
  /** If true, also updates the URL hash when active section changes. */
  updateHash?: boolean
  /** If true, smooth-scrolls to hash on mount + on hashchange. */
  smoothScrollOnHash?: boolean
}

export function useScrollSpy(
  sectionIds: string[],
  options: ScrollSpyOptions = {}
): string | null {
  const {
    rootMargin = '-30% 0px -60% 0px', // section is "active" when it's in the middle 10% of viewport
    threshold = 0,
    updateHash = true,
    smoothScrollOnHash = true,
  } = options

  const [activeId, setActiveId] = React.useState<string | null>(null)

  // Ref to hold the latest active id without re-running the effect
  const activeIdRef = React.useRef<string | null>(null)
  // Timestamp of the last manual navigation (click or hashchange).
  // The scroll spy will NOT override the URL for 800ms after this.
  const lastManualNavRef = React.useRef<number>(0)
  const setBoth = React.useCallback((id: string | null) => {
    activeIdRef.current = id
    setActiveId(id)
  }, [])

  // Listen for manual navigation events to suppress scroll-spy URL updates
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const markManual = () => { lastManualNavRef.current = Date.now() }
    // popstate = back/forward; hashchange = manual hash edit
    window.addEventListener('popstate', markManual)
    window.addEventListener('hashchange', markManual)
    return () => {
      window.removeEventListener('popstate', markManual)
      window.removeEventListener('hashchange', markManual)
    }
  }, [])

  /** Allow callers (e.g. SectionNav click handler) to mark a manual nav. */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__vendeyaMarkManualNav = () => {
        lastManualNavRef.current = Date.now()
      }
    }
  }, [])

  // =====================================================================
  // INTERSECTION OBSERVER — track active section
  // =====================================================================
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (sectionIds.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Suppress URL updates for 800ms after a manual navigation (click/back/fwd).
        // This prevents the scroll spy from overriding the URL while the
        // smooth-scroll animation is still in progress.
        const sinceManual = Date.now() - lastManualNavRef.current
        const allowUrlUpdate = sinceManual > 800

        // Find the entry with the highest intersection ratio that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          const id = visible[0].target.id
          if (id !== activeIdRef.current) {
            setBoth(id)
            if (updateHash && id && allowUrlUpdate) {
              // Update URL hash WITHOUT scrolling (we already scrolled by user)
              // and WITHOUT creating a new history entry on every change.
              // We replace state to avoid cluttering back/fwd history.
              const newUrl = `${window.location.pathname}#${id}`
              if (window.location.hash !== `#${id}`) {
                window.history.replaceState(window.history.state, '', newUrl)
              }
            }
          }
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    // Observe all sections
    const elements: HTMLElement[] = []
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
        elements.push(el)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [sectionIds.join(','), rootMargin, threshold, updateHash, setBoth])

  // =====================================================================
  // HASH CHANGE — smooth scroll on back/forward + on initial load
  // =====================================================================
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (!smoothScrollOnHash) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const scrollToHash = (hash: string, behavior: ScrollBehavior = 'smooth') => {
      const id = hash.replace('#', '')
      if (!id) return
      const el = document.getElementById(id)
      if (el) {
        // Use scrollIntoView for native smooth scroll + offset handling
        el.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : behavior,
          block: 'start',
        })
        // Also update active state immediately
        setBoth(id)
      }
    }

    // On mount: scroll to hash if present (deep link entry)
    if (window.location.hash) {
      // Defer to next frame so DOM is fully laid out
      requestAnimationFrame(() => scrollToHash(window.location.hash, 'auto'))
    }

    const onHashChange = (e: HashChangeEvent) => {
      // The browser's default is to jump; we prevent it via smooth scroll
      e.preventDefault()
      scrollToHash(window.location.hash, 'smooth')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [smoothScrollOnHash, setBoth])

  return activeId
}
