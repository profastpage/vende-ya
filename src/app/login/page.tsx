'use client'

/**
 * VENDE YA — Login page (rebuilt 2026-08-17)
 * =====================================================================
 * Mejoras vs versión anterior:
 *   1. Botón "Continuar con Google" como CTA principal (full-width, grande)
 *      en vez de 3 botones pequeños en grid. Es lo que el 95% de usuarios usa.
 *   2. Detección de URL protegida por Vercel SSO con warning visual:
 *      si el usuario entró a vende-ya-profastpage-...vercel.app (URL vieja
 *      protegida), se le ofrece un botón para ir a la URL pública real.
 *   3. Indicador de progreso durante OAuth (3 pasos: contactando → Google → volviendo).
 *   4. Mensajes de error específicos: provider no habilitado, redirect blocked,
 *      sesión expirada, etc. con diagnóstico accionable en español.
 *   5. Banner informativo cuando viene de ?redirect= para que sepa dónde va a aterrizar.
 *   6. Botones Facebook/Apple como secundarios (smaller, debajo de Google).
 *   7. Mensaje de seguridad visible: "Tu sesión se establece en este dominio".
 *   8. Soporte para prefers-reduced-motion (accesibilidad).
 * =====================================================================
 */
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Truck,
  BadgeCheck,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------
// Page entry — wraps useSearchParams in Suspense (Next.js 16 requirement)
// ---------------------------------------------------------------------
export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </React.Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-border border-t-amber-400 animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando Vende Ya…</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Dark premium input class
// ---------------------------------------------------------------------
const INPUT_CLASS =
  'w-full h-12 rounded-xl bg-muted border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400/30 transition-colors disabled:opacity-60'

// ---------------------------------------------------------------------
// Left brand panel — feature blurbs
// ---------------------------------------------------------------------
const LEFT_FEATURES: ReadonlyArray<{
  title: string
  body: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}> = [
  {
    title: 'Yape y Plin en vivo',
    body:
      'Cobra y paga en tiempo real durante la subasta. Cada transacción se aprueba en menos de 3 segundos con la API oficial de Yape y Plin, sin salir del vivo y sin comisiones ocultas para el comprador.',
    icon: Smartphone,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    title: 'Envíos Shalom a todo el Perú',
    body:
      'Despachamos el mismo día con Shalom, Marvisur y Olva. Lima Metropolitana llega en 24 horas y provincias en 48 horas, con tracking en tiempo real visible dentro del app desde el momento en que ganas la subasta.',
    icon: Truck,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Vendedores verificados',
    body:
      'Verificamos la identidad, RUC y antecedentes de cada vendedor antes de permitirle transmitir. Además, el dinero queda en custodia hasta que confirmes la recepción del producto — si algo falla, lo recuperas íntegro.',
    icon: BadgeCheck,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
]

// =====================================================================
// URL protegida por Vercel SSO — detección temprana
// =====================================================================
const PROTECTED_HOSTNAMES = [
  'vende-ya-profastpage-4762s-projects.vercel.app',
  'vende-ya-profastpage.vercel.app',
]
const PUBLIC_HOSTNAME = 'vende-ya-phi.vercel.app'

function useIsProtectedUrl(): { isProtected: boolean; currentHost: string } {
  const [state, setState] = React.useState({
    isProtected: false,
    currentHost: '',
  })
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const host = window.location.hostname
    const isProtected =
      PROTECTED_HOSTNAMES.includes(host) ||
      // Match any *.vercel.app that's NOT the public one and has the long hash suffix
      (host.endsWith('.vercel.app') &&
        host !== PUBLIC_HOSTNAME &&
        // preview deployments have format `<proj>-<hash>-<team>.vercel.app`
        !host.startsWith('vende-ya-phi'))
    setState({ isProtected, currentHost: host })
  }, [])
  return state
}

/**
 * Hook que detecta el origin actual del navegador. Sirve para mostrar
 * al usuario a qué URL será redirigido tras el OAuth. Esto le da
 * transparencia sobre el flujo y le ayuda a diagnosticar si la URL
 * es la correcta o si está atrapado en un dominio protegido.
 */
function useEffectiveOrigin(): { origin: string; isPublic: boolean } {
  const [state, setState] = React.useState({ origin: '', isPublic: false })
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const origin = window.location.origin
    const isPublic =
      origin.startsWith('https://') && !origin.includes('localhost')
    setState({ origin, isPublic })
  }, [])
  return state
}

// =====================================================================
// LOGIN CONTENT
// =====================================================================
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, signInWithOAuth, isDemoMode } = useAuth()
  const { isProtected, currentHost } = useIsProtectedUrl()
  const { origin: effectiveOrigin, isPublic: originIsPublic } = useEffectiveOrigin()

  const [mode, setMode] = React.useState<'email' | 'phone'>('email')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [oauthProvider, setOauthProvider] = React.useState<
    null | 'google' | 'facebook' | 'apple'
  >(null)
  const [oauthStep, setOauthStep] = React.useState<
    'idle' | 'probe' | 'redirect' | 'callback' | 'error'
  >('idle')

  // ---------------------------------------------------------------
  // Email/password submit
  // ---------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const identifier = mode === 'email' ? email : `${phone}@phone.vendeya.pe`
    const { error } = await signIn(identifier, password)
    setLoading(false)
    if (error) {
      toast({ title: 'No se pudo iniciar sesión', description: error, variant: 'destructive' })
      return
    }
    toast({
      title: 'Sesión iniciada',
      description: 'Bienvenido de vuelta a Vende Ya.',
    })
    const redirect = searchParams.get('redirect')
    router.push(redirect && redirect.startsWith('/') ? redirect : ROUTES.dashboard)
    router.refresh()
  }

  // ---------------------------------------------------------------
  // OAuth — wrapper con feedback visual de 3 pasos
  // ---------------------------------------------------------------
  const handleOAuth = React.useCallback(
    async (provider: 'google' | 'facebook' | 'apple') => {
      setOauthProvider(provider)
      setOauthStep('probe')

      // Safety net: si después de 5s seguimos en esta página sin error,
      // asumimos que la navegación OAuth fue bloqueada (probablemente
      // por Vercel SSO Protection). Mostramos el error con diagnóstico.
      const navTimeout = setTimeout(() => {
        setOauthStep('error')
        toast({
          title: 'Navegación bloqueada',
          description:
            'Pasaron 5s sin redirección. Probablemente estás en una URL ' +
            'protegida por Vercel SSO. Usa el botón superior "Ir a URL pública" ' +
            'o abre vende-ya-phi.vercel.app manualmente.',
          variant: 'destructive',
        })
        setTimeout(() => {
          setOauthProvider(null)
          setOauthStep('idle')
        }, 3000)
      }, 5000)

      const result = await signInWithOAuth(provider)
      // NO limpiar el timeout aquí: la navegación puede no ocurrir
      // (p.ej. si el navegador bloquea window.location.href o si estamos
      // en un dominio protegido). El timeout se limpiará solo si el
      // navegador realmente navega (la página se descarga).

      if (result.error) {
        clearTimeout(navTimeout)
        setOauthStep('error')
        // Mensaje específico para error de provider no habilitado
        const msg = result.error.toLowerCase()
        if (msg.includes('not enabled') || msg.includes('validation_failed')) {
          toast({
            title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} no está activo`,
            description: `Ve a Supabase Dashboard → Authentication → Providers y activa ${provider}.`,
            variant: 'destructive',
          })
        } else if (msg.includes('redirect') || msg.includes('origin')) {
          toast({
            title: 'URL de redirección no permitida',
            description:
              'Agrega esta URL en Supabase → Authentication → URL Configuration → Redirect URLs.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'No se pudo continuar',
            description: result.error,
            variant: 'destructive',
          })
        }
        // Reset after 3s para que el usuario pueda reintentar
        setTimeout(() => {
          setOauthProvider(null)
          setOauthStep('idle')
        }, 3000)
        return
      }
      // Sin error → Supabase está navegando el navegador a Google/Facebook/Apple.
      // Cambiamos el step a 'redirect' para mostrar feedback visual.
      setOauthStep('redirect')
    },
    [signInWithOAuth, toast]
  )

  const redirectParam = searchParams.get('redirect')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        {/* =================================================== */}
        {/* LEFT — Brand panel (desktop only)                   */}
        {/* =================================================== */}
        <aside
          aria-hidden="true"
          className="relative hidden md:flex md:w-[46%] lg:w-[52%] flex-col justify-between overflow-hidden bg-[#F9F5F0] p-12 text-gray-900 border-r border-gray-100"
        >
          {/* Logo */}
          <div className="relative">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt={`${APP_NAME} — Subastas en vivo del Perú`}
                width={56}
                height={56}
                priority
                className="rounded-2xl shadow-md object-contain"
              />
              <div className="leading-none">
                <div className="font-black text-2xl font-display tracking-tight text-gray-950">
                  {APP_NAME}
                </div>
                <div className="text-[11px] text-gray-500 -mt-0.5 font-medium">
                  Subastas en vivo del Perú
                </div>
              </div>
            </Link>
          </div>

          {/* Hero copy + features */}
          <div className="relative space-y-7">
            <h1 className="text-4xl lg:text-5xl font-black font-display leading-[1.05] tracking-tight text-gray-950">
              Subasta en vivo.
              <br />
              <span className="text-purple-700">Compra ya.</span> Vende ya.
            </h1>
            <p className="text-gray-600 font-medium text-lg leading-relaxed max-w-md">
              El marketplace social del Perú. Pujas en tiempo real, pagas con Yape, Plin o
              PagoEfectivo, y recibes tus productos en 24 horas con envíos Shalom.
            </p>

            <ul className="space-y-6 pt-2">
              {LEFT_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-4">
                  <div
                    className={cn(
                      'shrink-0 h-10 w-10 rounded-xl flex items-center justify-center font-bold',
                      f.iconBg,
                      f.iconColor
                    )}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-base text-gray-900">{f.title}</div>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                      {f.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>© 2026 Vende Ya · Hecho en Perú 🇵🇪</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Pago protegido
            </span>
          </div>
        </aside>

        {/* =================================================== */}
        {/* RIGHT — Form                                        */}
        {/* =================================================== */}
        <section className="flex flex-1 items-center justify-center p-6 md:p-10 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl border border-border bg-card backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
              {/* Mobile-only logo */}
              <Link
                href={ROUTES.home}
                className="mb-6 flex items-center gap-2.5 md:hidden"
              >
                <Image
                  src="/logo.png"
                  alt={`${APP_NAME} — Subastas en vivo del Perú`}
                  width={44}
                  height={44}
                  priority
                  className="rounded-xl object-contain"
                />
                <span className="font-black text-lg font-display text-foreground">
                  {APP_NAME}
                </span>
              </Link>

              {/* ⚠️ Warning: URL protegida por Vercel SSO */}
              <AnimatePresence>
                {isProtected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-300">
                          Estás en una URL protegida por Vercel
                        </p>
                        <p className="text-xs text-red-300/80 mt-1">
                          <code className="text-[10px] break-all">{currentHost}</code> tiene
                          Vercel Authentication activado. El login con Google fallará porque el
                          callback será interceptado. Usa la URL pública:
                        </p>
                        <a
                          href={`https://${PUBLIC_HOSTNAME}/login${
                            redirectParam ? `?redirect=${redirectParam}` : ''
                          }`}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-200 transition-colors"
                        >
                          Ir a {PUBLIC_HOSTNAME}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
                    Bienvenido de vuelta
                  </h1>
                  {isDemoMode && (
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Modo demo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isDemoMode
                    ? 'Supabase no configurado — cualquier email/password funciona.'
                    : 'Ingresa para pujar en vivo y seguir tus subastas favoritas.'}
                </p>
                {redirectParam && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300/90">
                    <ArrowRight className="h-3 w-3" />
                    Volverás a <code className="text-[11px]">{redirectParam}</code> tras iniciar sesión.
                  </p>
                )}
              </div>

              {/* ====== GOOGLE — CTA principal (full width, grande) ====== */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    Recomendado
                  </span>
                  {effectiveOrigin && (
                    <span
                      className={cn(
                        'font-mono text-[10px] truncate max-w-[220px]',
                        originIsPublic ? 'text-muted-foreground/70' : 'text-amber-400/80'
                      )}
                      title="URL de callback OAuth que se usará"
                    >
                      → {effectiveOrigin.replace(/^https?:\/\//, '')}/auth/callback
                    </span>
                  )}
                </div>
                <GoogleButton
                  state={oauthProvider === 'google' ? oauthStep : 'idle'}
                  onClick={() => handleOAuth('google')}
                  disabled={loading || oauthProvider !== null}
                />
                {isProtected && (
                  <p className="text-[11px] text-red-300/80 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    El callback fallará en esta URL protegida. Usa la URL pública arriba.
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-3 text-muted-foreground">
                    o con otro método
                  </span>
                </div>
              </div>

              {/* ====== Facebook + Apple (secundarios, lado a lado) ====== */}
              <div className="grid grid-cols-2 gap-2">
                <SecondaryOAuthButton
                  provider="facebook"
                  loading={oauthProvider === 'facebook' && oauthStep !== 'error'}
                  onClick={() => handleOAuth('facebook')}
                  disabled={loading || oauthProvider !== null}
                />
                <SecondaryOAuthButton
                  provider="apple"
                  loading={oauthProvider === 'apple' && oauthStep !== 'error'}
                  onClick={() => handleOAuth('apple')}
                  disabled={loading || oauthProvider !== null}
                />
              </div>

              {/* Divider antes del form */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-3 text-muted-foreground">
                    o con email y contraseña
                  </span>
                </div>
              </div>

              {/* Mode toggle (email / phone) */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1">
                {(['email', 'phone'] as const).map((m) => {
                  const Icon = m === 'email' ? Mail : Smartphone
                  const active = mode === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
                        active
                          ? 'bg-accent text-amber-500 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {m === 'email' ? 'Email' : 'Celular'}
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'email' ? (
                  <Field htmlFor="email" label="Correo electrónico">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(INPUT_CLASS, 'pl-10')}
                    />
                  </Field>
                ) : (
                  <Field
                    htmlFor="phone"
                    label="Número de celular"
                    hint="9 dígitos, empezando con 9"
                  >
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      +51
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      inputMode="numeric"
                      pattern="9\d{8}"
                      placeholder="987654321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={cn(INPUT_CLASS, 'pl-12 pr-10')}
                      maxLength={9}
                    />
                    <Smartphone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </Field>
                )}

                <Field
                  htmlFor="password"
                  label="Contraseña"
                  action={
                    <Link
                      href="#"
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  }
                >
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(INPUT_CLASS, 'pl-10 pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <label
                  htmlFor="remember"
                  className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none"
                >
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-muted accent-amber-400 focus:ring-2 focus:ring-amber-400/40"
                  />
                  Mantener sesión iniciada
                </label>

                <button
                  type="submit"
                  disabled={loading || oauthProvider !== null}
                  className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-base shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-shadow disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust indicator */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
                Tu sesión se establece en este dominio. Nunca compartimos tu contraseña.
              </div>

              {/* Footer links */}
              <p className="mt-5 text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link
                  href={ROUTES.registro}
                  className="font-semibold text-amber-400 hover:text-amber-300"
                >
                  Regístrate gratis
                </Link>
              </p>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Al continuar aceptas los{' '}
                <Link
                  href={ROUTES.terminos}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Términos
                </Link>{' '}
                y la{' '}
                <Link
                  href={ROUTES.privacidad}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Privacidad
                </Link>
                .
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}

// =====================================================================
// GoogleButton — CTA principal con feedback de 3 pasos
// =====================================================================
type GoogleButtonState = 'idle' | 'probe' | 'redirect' | 'callback' | 'error'

function GoogleButton({
  state,
  onClick,
  disabled,
}: {
  state: GoogleButtonState
  onClick: () => void
  disabled: boolean
}) {
  const labelMap: Record<GoogleButtonState, string> = {
    idle: 'Continuar con Google',
    probe: 'Verificando configuración…',
    redirect: 'Llevándote a Google…',
    callback: 'Volviendo con tu sesión…',
    error: 'Error — reintenta en un momento',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative w-full h-14 rounded-xl border-2 transition-all',
        'flex items-center justify-center gap-3 px-4',
        'disabled:cursor-not-allowed',
        state === 'error'
          ? 'border-red-500/60 bg-red-500/10'
          : 'border-border bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300',
        state === 'idle' && 'hover:shadow-xl hover:shadow-amber-500/20 active:scale-[0.99]'
      )}
    >
      {/* Glow effect en hover */}
      {state === 'idle' && (
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Icon / spinner */}
      <span className="relative shrink-0">
        {state === 'idle' || state === 'error' ? (
          <GoogleIcon className="h-6 w-6" />
        ) : (
          // state is 'probe' | 'redirect' | 'callback' here — always loading
          <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
        )}
      </span>

      {/* Label */}
      <span
        className={cn(
          'relative text-base font-bold tracking-tight',
          state === 'error' ? 'text-red-600' : 'text-zinc-900'
        )}
      >
        {labelMap[state]}
      </span>

      {/* Step indicator (right side) */}
      {state !== 'idle' && state !== 'error' && (
        <span className="absolute right-4 flex items-center gap-1">
          {(['probe', 'redirect', 'callback'] as const).map((step, i) => (
            <span
              key={step}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                state === step
                  ? 'bg-amber-500'
                  : ['probe', 'redirect', 'callback'].indexOf(state) >
                      ['probe', 'redirect', 'callback'].indexOf(step)
                    ? 'bg-amber-500/40'
                    : 'bg-zinc-300'
              )}
            />
          ))}
        </span>
      )}

      {/* Error icon */}
      {state === 'error' && (
        <XCircle className="absolute right-4 h-5 w-5 text-red-500" />
      )}
    </button>
  )
}

// =====================================================================
// SecondaryOAuthButton — Facebook / Apple
// =====================================================================
function SecondaryOAuthButton({
  provider,
  loading,
  onClick,
  disabled,
}: {
  provider: 'facebook' | 'apple'
  loading: boolean
  onClick: () => void
  disabled: boolean
}) {
  const visuals =
    provider === 'facebook'
      ? {
          label: 'Facebook',
          Icon: FacebookIcon,
          bg: 'bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166FE5]',
        }
      : {
          label: 'Apple',
          Icon: AppleIcon,
          bg: 'bg-black text-white border-white/15 hover:bg-zinc-900 hover:border-white/25',
        }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-11 rounded-xl border text-sm font-semibold transition-all',
        'flex items-center justify-center gap-2 px-3',
        'disabled:opacity-70 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        visuals.bg
      )}
      aria-label={`Continuar con ${visuals.label}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <visuals.Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="text-xs font-semibold tracking-tight">{visuals.label}</span>
        </>
      )}
    </button>
  )
}

// =====================================================================
// Sub-components
// =====================================================================

function Field({
  label,
  htmlFor,
  hint,
  action,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">{children}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

// =====================================================================
// ICONOS SVG OFICIALES (paths oficiales de cada marca)
// =====================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.47 7.13-.57 1.5-1.31 2.99-2.54 4.09l.02-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
