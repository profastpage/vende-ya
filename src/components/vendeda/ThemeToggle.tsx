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
 * =====================================================================
 */
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Placeholder estático (mismo tamaño que el botón real) — evita CLS
  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-lg bg-muted animate-pulse"
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
        'h-9 w-9 rounded-lg flex items-center justify-center transition-all active:scale-90',
        'border border-border',
        'bg-muted hover:bg-accent',
        'text-foreground',
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
