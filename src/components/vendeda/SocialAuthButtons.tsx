'use client'

/**
 * SocialAuthButtons — Botones de OAuth (Google / Facebook / Apple)
 * =====================================================================
 * - Renderiza los logos SVG reales de cada proveedor (no texto plano).
 * - Detecta el error `Unsupported provider: provider is not enabled` que
 *   devuelve Supabase cuando el provider no está activado en el dashboard,
 *   y muestra un mensaje en español indicando al usuario cómo activarlo.
 * - Componente compartido entre /login y /registro para mantener UX 1:1.
 *
 * Uso:
 *   <SocialAuthButtons
 *     signInWithOAuth={signInWithOAuth}
 *     onLoadingChange={setLoading}
 *     onError={(msg) => toast({ description: msg, variant: 'destructive' })}
 *   />
 * =====================================================================
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

type Provider = 'google' | 'facebook' | 'apple'

interface SocialAuthButtonsProps {
  signInWithOAuth: (
    provider: Provider
  ) => Promise<{ error: string | null }>
  /** Se llama con `true` mientras se dispara la redirección OAuth, `false` si hay error */
  onLoadingChange?: (loading: boolean) => void
  /** Callback opcional para mostrar el error en un toast/UI */
  onError?: (message: string) => void
  /** Layout: 'grid' = 3 columnas (default) | 'stack' = 1 columna apilada */
  layout?: 'grid' | 'stack'
  /** Etiqueta del separador; si se omite no se renderiza divisor */
  dividerLabel?: string
}

export function SocialAuthButtons({
  signInWithOAuth,
  onLoadingChange,
  onError,
  layout = 'grid',
  dividerLabel = 'o continúa con',
}: SocialAuthButtonsProps) {
  const [busy, setBusy] = React.useState<Provider | null>(null)

  const handleClick = async (provider: Provider) => {
    setBusy(provider)
    onLoadingChange?.(true)
    const result = await signInWithOAuth(provider)
    if (result.error) {
      const humanized = humanizeOAuthError(result.error, provider)
      setBusy(null)
      onLoadingChange?.(false)
      onError?.(humanized)
    }
    // Si no hay error, Supabase redirige al navegador — no hace falta resetear busy.
  }

  return (
    <>
      {dividerLabel && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground">{dividerLabel}</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-3 gap-2'
            : 'flex flex-col gap-2'
        )}
      >
        <SocialButton
          provider="google"
          loading={busy === 'google'}
          onClick={() => handleClick('google')}
        />
        <SocialButton
          provider="facebook"
          loading={busy === 'facebook'}
          onClick={() => handleClick('facebook')}
        />
        <SocialButton
          provider="apple"
          loading={busy === 'apple'}
          onClick={() => handleClick('apple')}
        />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------
// Botón individual con icono real del proveedor
// ---------------------------------------------------------------------
function SocialButton({
  provider,
  loading,
  onClick,
}: {
  provider: Provider
  loading: boolean
  onClick: () => void
}) {
  const { Icon, label, bgClass, hoverClass } = PROVIDER_VISUALS[provider]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={`Continuar con ${label}`}
      className={cn(
        'relative h-11 rounded-xl border text-sm font-semibold transition-all',
        'flex items-center justify-center gap-2 px-3',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        'active:scale-[0.98] hover:shadow-lg hover:shadow-black/30',
        bgClass,
        hoverClass
      )}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : (
        <>
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="text-xs font-semibold tracking-tight">{label}</span>
        </>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------
// Visuales por proveedor — fondo + icono + hover
// ---------------------------------------------------------------------
const PROVIDER_VISUALS: Record<
  Provider,
  {
    label: string
    bgClass: string
    hoverClass: string
    Icon: (props: { className?: string }) => React.JSX.Element
  }
> = {
  google: {
    label: 'Google',
    bgClass: 'bg-white text-foreground border-border',
    hoverClass: 'hover:bg-muted/60 hover:border-border',
    Icon: GoogleIcon,
  },
  facebook: {
    label: 'Facebook',
    bgClass:
      'bg-[#1877F2] text-white border-[#1877F2]',
    hoverClass: 'hover:bg-[#166FE5] hover:border-[#166FE5]',
    Icon: FacebookIcon,
  },
  apple: {
    label: 'Apple',
    bgClass: 'bg-black text-white border-white/15',
    hoverClass: 'hover:bg-zinc-800 hover:text-white',
    Icon: AppleIcon,
  },
}

// =====================================================================
// ICONOS SVG OFICIALES (paths oficiales de cada marca)
// =====================================================================

/**
 * Logo de Google — versión multicolor oficial (4 colores de marca).
 * Fuente: https://developers.google.com/identity/branding-guidelines
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/**
 * Logo de Facebook — "f" sobre círculo azul oficial.
 */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

/**
 * Logo de Apple — manzana negra oficial con hoja y mordisco.
 */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.47 7.13-.57 1.5-1.31 2.99-2.54 4.09l.02-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

// =====================================================================
// ERRORES HUMANIZADOS — traducción de errores de Supabase al español
// =====================================================================

/**
 * Convierte el error crudo de Supabase a un mensaje amigable en español.
 * Maneja especialmente `Unsupported provider: provider is not enabled` que
 * aparece cuando Google/Facebook/Apple no están activados en el dashboard
 * de Supabase → Authentication → Providers.
 *
 * El error puede llegar como:
 *   - Texto plano: "Unsupported provider: provider is not enabled"
 *   - JSON crudo : `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`
 * Esta función detecta ambos formatos.
 */
export function humanizeOAuthError(error: string, provider: Provider): string {
  const p = provider.charAt(0).toUpperCase() + provider.slice(1)
  const msg = error.toLowerCase()

  // Caso 1: JSON crudo con error_code validation_failed o msg "provider not enabled"
  if (
    (msg.includes('validation_failed') && msg.includes('provider')) ||
    (msg.includes('provider') && msg.includes('not enabled'))
  ) {
    return (
      `${p} aún no está activado en el backend. ` +
      `Ve a tu proyecto de Supabase → Authentication → Providers → ` +
      `activa "${provider}" con tu Client ID y Secret de Google Cloud Console. ` +
      `Mientras tanto, puedes iniciar sesión con email y contraseña.`
    )
  }

  // Caso 2: texto plano "provider not enabled"
  if (msg.includes('provider') && msg.includes('not enabled')) {
    return (
      `${p} aún no está activado en el backend. ` +
      `Ve a tu proyecto de Supabase → Authentication → Providers → ` +
      `activa "${provider}" con tu Client ID y Secret.`
    )
  }

  if (msg.includes('provider') && msg.includes('unsupported')) {
    return (
      `El proveedor ${p} no está soportado por la configuración actual. ` +
      `Verifica en Supabase → Authentication → Providers.`
    )
  }

  if (msg.includes('oauth') && msg.includes('not')) {
    return `No se pudo iniciar OAuth con ${p}. Revisa la configuración del proveedor.`
  }

  if (msg.includes('redirect') || msg.includes('origin')) {
    return (
      `Error de redirección con ${p}. Asegúrate de que la URL ` +
      `${typeof window !== 'undefined' ? window.location.origin : 'del sitio'} ` +
      `esté en la lista de Redirect URLs de Supabase → Authentication → URL Configuration.`
    )
  }

  if (msg.includes('timeout') || msg.includes('network')) {
    return `No se pudo conectar con ${p}. Revisa tu conexión a internet e inténtalo de nuevo.`
  }

  // Fallback genérico — si el error es un JSON crudo, lo ocultamos y damos
  // un mensaje claro en español.
  if (msg.startsWith('{') || msg.includes('"error_code"')) {
    return (
      `No se pudo continuar con ${p}. Revisa que el proveedor esté activado ` +
      `en Supabase → Authentication → Providers.`
    )
  }

  return `No se pudo continuar con ${p}: ${error}`
}
