'use client'

/**
 * ThemeToggle — Switch claro/oscuro accesible e hidratado sin parpadeo.
 * =====================================================================
 *  - Usa next-themes `useTheme` para alternar la clase `.dark` en <html>.
 *  - `mounted` evita hydration mismatch: el botón real solo se pinta
 *    después del hidratado del cliente.
 *  - Antes del mount se muestra un placeholder estático del mismo tamaño
 *    para evitar layout shift (CLS).
 *  - Tokens semánticos: soporta `light` y `dark` automáticamente.
 *
 *  NOTE sobre el lint rule `react-hooks/set-state-in-effect`:
 *  La regla prohíbe `setState` directo dentro del cuerpo de un effect
 *  porque puede causar cascading renders. El patrón `setMounted(true)` en
 *  un effect vacío es el IDIOMA CANÓNICO documentado por next-themes
 *  (https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch),
 *  pero como React 19+ lo marca, lo evitamos usando `useSyncExternalStore`
 *  para detectar el mount sin disparar un re-render síncrono desde el effect.
 * =====================================================================
 */
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Empty store that returns `false` on server and `true` on client after mount.
// This avoids the `setState in effect` pattern while still detecting hydration.
const emptySubscribe = () => () => {}
const getSnapshot = () => true // Always true on client after hydration
const getServerSnapshot = () => false // Always false during SSR

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  // `mounted` becomes true ONLY on the client, after hydration.
  // useSyncExternalStore doesn't trigger a cascading render — it's
  // the React-blessed pattern for "is this client-side yet?".
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)

  // Placeholder estático (mismo tamaño que el botón real) — evita CLS
  if (!mounted) {
    return (
      <div
        className="h-9 w-9 animate-pulse"
        aria-hidden
      />
    )
  }

  const isDark = (resolvedTheme ?? theme) === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'h-9 w-9 flex items-center justify-center transition-all active:scale-90',
        'text-foreground hover:opacity-70',
      )}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={2.5} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={2.5} />
      )}
    </button>
  )
}
