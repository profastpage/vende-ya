'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { SocialAuthButtons } from '@/components/vendeda/SocialAuthButtons'
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-amber-400 animate-spin" />
    </div>
  )
}

// ---------------------------------------------------------------------
// Dark premium input class — shared by both auth pages
// ---------------------------------------------------------------------
const INPUT_CLASS =
  'w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus-visible:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400/30 transition-colors disabled:opacity-60'

// ---------------------------------------------------------------------
// Left brand panel — feature blurbs (module-level so React doesn't
// re-mount them on each render)
// ---------------------------------------------------------------------
const LEFT_FEATURES: ReadonlyArray<{
  title: string
  body: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  ring: string
  glow: string
}> = [
  {
    title: 'Yape y Plin en vivo',
    body:
      'Cobra y paga en tiempo real durante la subasta. Cada transacción se aprueba en menos de 3 segundos con la API oficial de Yape y Plin, sin salir del vivo y sin comisiones ocultas para el comprador.',
    icon: Smartphone,
    accent: 'text-amber-400',
    ring: 'bg-amber-500/10 border-amber-500/30',
    glow: 'shadow-amber-500/30',
  },
  {
    title: 'Envíos Shalom a todo el Perú',
    body:
      'Despachamos el mismo día con Shalom, Marvisur y Olva. Lima Metropolitana llega en 24 horas y provincias en 48 horas, con tracking en tiempo real visible dentro del app desde el momento en que ganas la subasta.',
    icon: Truck,
    accent: 'text-fuchsia-400',
    ring: 'bg-fuchsia-500/10 border-fuchsia-500/30',
    glow: 'shadow-fuchsia-500/30',
  },
  {
    title: 'Vendedores verificados',
    body:
      'Verificamos la identidad, RUC y antecedentes de cada vendedor antes de permitirle transmitir. Además, el dinero queda en custodia hasta que confirmes la recepción del producto — si algo falla, lo recuperas íntegro.',
    icon: BadgeCheck,
    accent: 'text-lime-400',
    ring: 'bg-lime-500/10 border-lime-500/30',
    glow: 'shadow-lime-500/30',
  },
]

// =====================================================================
// LOGIN CONTENT
// =====================================================================
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, signInWithOAuth, isDemoMode } = useAuth()
  // ⚠️ signInWithOAuth se pasa al componente <SocialAuthButtons /> abajo

  const [mode, setMode] = React.useState<'email' | 'phone'>('email')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  // ---------------------------------------------------------------
  // Submit — preserves redirect param + Supabase signIn call
  // ---------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const identifier = mode === 'email' ? email : `${phone}@phone.vendeya.pe`
    const { error } = await signIn(identifier, password)
    setLoading(false)
    if (error) {
      toast({ title: '❌ Error', description: error, variant: 'destructive' })
      return
    }
    toast({
      title: '✅ Sesión iniciada',
      description: 'Bienvenido de vuelta a Vende Ya.',
    })
    // Respetar el parámetro ?redirect= para volver a la página que pidió el checkout.
    const redirect = searchParams.get('redirect')
    router.push(redirect && redirect.startsWith('/') ? redirect : ROUTES.dashboard)
    router.refresh()
  }

  // ---------------------------------------------------------------
  // OAuth — delegado al componente <SocialAuthButtons />
  // (maneja internamente el error "provider is not enabled")
  // ---------------------------------------------------------------

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
        {/* =================================================== */}
        {/* LEFT — Brand panel (desktop only)                   */}
        {/* =================================================== */}
        <aside
          aria-hidden="true"
          className="relative hidden md:flex md:w-[46%] lg:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-500/20 via-fuchsia-900/30 to-zinc-950 p-12"
        >
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-purple-700/10 blur-3xl" />

          {/* Logo — imagen oficial /logo.png */}
          <div className="relative">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt={`${APP_NAME} — Subastas en vivo del Perú`}
                width={56}
                height={56}
                priority
                className="rounded-2xl shadow-lg shadow-fuchsia-500/40 object-contain"
              />
              <div className="leading-none">
                <div className="font-black text-2xl font-display tracking-tight bg-gradient-to-r from-amber-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
                  {APP_NAME}
                </div>
                <div className="text-[11px] text-zinc-400 -mt-0.5">Subastas en vivo del Perú</div>
              </div>
            </Link>
          </div>

          {/* Hero copy + features */}
          <div className="relative space-y-7">
            <h2 className="text-4xl lg:text-5xl font-black font-display leading-[1.05] tracking-tight">
              Subasta en vivo.
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-fuchsia-300 bg-clip-text text-transparent">
                Compra ya. Vende ya.
              </span>
            </h2>
            <p className="text-zinc-300/90 text-lg leading-relaxed max-w-md">
              El marketplace social del Perú. Pujas en tiempo real, pagas con Yape, Plin o
              PagoEfectivo, y recibes tus productos en 24 horas con envíos Shalom.
            </p>

            <ul className="space-y-5 pt-2">
              {LEFT_FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <div
                    className={cn(
                      'shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center shadow-lg',
                      f.ring,
                      f.glow
                    )}
                  >
                    <f.icon className={cn('h-5 w-5', f.accent)} />
                  </div>
                  <div className="space-y-1">
                    <div className={cn('font-bold text-sm', f.accent)}>{f.title}</div>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between text-xs text-zinc-500">
            <span>© 2026 Vende Ya · Hecho en Perú 🇵🇪</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
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
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
              {/* Mobile-only logo — imagen oficial /logo.png */}
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
                <span className="font-black text-lg font-display text-white">{APP_NAME}</span>
              </Link>

              {/* Title */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black font-display tracking-tight text-white">
                    Bienvenido de vuelta
                  </h1>
                  {isDemoMode && (
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Modo demo
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400">
                  {isDemoMode
                    ? 'Supabase no configurado — cualquier email/password funciona.'
                    : 'Ingresa para pujar en vivo y seguir tus subastas favoritas.'}
                </p>
              </div>

              {/* Mode toggle (email / phone) */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
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
                          ? 'bg-white/10 text-amber-400 shadow-sm'
                          : 'text-zinc-400 hover:text-white'
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
                  <Field
                    htmlFor="email"
                    label="Correo electrónico"
                  >
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
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
                    <Smartphone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                <label
                  htmlFor="remember"
                  className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none"
                >
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-400 focus:ring-2 focus:ring-amber-400/40"
                  />
                  Mantener sesión iniciada
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-base shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-shadow disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-zinc-950/40 border-t-zinc-950 animate-spin" />
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

              {/* Social login — Google (multicolor) / Facebook / Apple
                  Componente compartido con /registro para UX 1:1 */}
              <SocialAuthButtons
                signInWithOAuth={signInWithOAuth}
                onLoadingChange={setLoading}
                onError={(msg) =>
                  toast({
                    title: '❌ No se pudo continuar',
                    description: msg,
                    variant: 'destructive',
                  })
                }
              />

              {/* Footer links */}
              <p className="mt-6 text-center text-sm text-zinc-400">
                ¿No tienes cuenta?{' '}
                <Link
                  href={ROUTES.registro}
                  className="font-semibold text-amber-400 hover:text-amber-300"
                >
                  Regístrate gratis
                </Link>
              </p>
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Al continuar aceptas los{' '}
                <Link href={ROUTES.terminos} className="text-amber-400 hover:text-amber-300 underline">
                  Términos
                </Link>{' '}
                y la{' '}
                <Link href={ROUTES.privacidad} className="text-amber-400 hover:text-amber-300 underline">
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
// Sub-components — hoisted to module level (satisfies ESLint
// react-hooks/static-components and avoids remounting on each render)
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
        <label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-200">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">{children}</div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
