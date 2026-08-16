'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Rocket,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { SocialAuthButtons } from '@/components/vendeda/SocialAuthButtons'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { isValidPeruvianPhone } from '@/lib/vendeda/format'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------
// Dark premium input class — shared with login
// ---------------------------------------------------------------------
const INPUT_CLASS =
  'w-full h-12 rounded-xl bg-muted border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:border-amber-400/60 focus-visible:ring-2 focus-visible:ring-amber-400/30 transition-colors disabled:opacity-60'

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
    title: 'Empieza a vender en 5 minutos',
    body:
      'Crea tu tienda, sube tu primer producto y empieza a transmitir en vivo desde el celular. Te guiamos paso a paso con un asistente de IA que escribe las descripciones y sugiere precios justos según el mercado peruano.',
    icon: Rocket,
    accent: 'text-amber-400',
    ring: 'bg-amber-500/10 border-amber-500/30',
    glow: 'shadow-amber-500/30',
  },
  {
    title: 'Cobra con Yape, Plin o tarjeta',
    body:
      'Conecta tu cuenta de Yape o Plin una sola vez y cobra automáticamente al comprador cuando finaliza la subasta. El dinero llega a tu cuenta en menos de 1 minuto, sin trámites ni facturación manual.',
    icon: Sparkles,
    accent: 'text-fuchsia-400',
    ring: 'bg-fuchsia-500/10 border-fuchsia-500/30',
    glow: 'shadow-fuchsia-500/30',
  },
  {
    title: 'Comunidad de compradores activos',
    body:
      'Más de 50 mil peruanos comprando en vivo cada semana. Tu primera transmisión puede llegar a 200 espectadores orgánicos sin pagar publicidad, gracias al algoritmo que prioriza vendedores nuevos verificados.',
    icon: ShieldCheck,
    accent: 'text-lime-400',
    ring: 'bg-lime-500/10 border-lime-500/30',
    glow: 'shadow-lime-500/30',
  },
]

// =====================================================================
// PAGE ENTRY
// =====================================================================
export default function RegistroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signUp, signInWithOAuth, isDemoMode } = useAuth()

  const [name, setName] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [acceptTerms, setAcceptTerms] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  // ---------------------------------------------------------------
  // Password strength — 0..4 scale
  // ---------------------------------------------------------------
  const strength = React.useMemo(() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  }, [password])

  const strengthLabel = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][strength]
  const strengthColor = [
    'bg-rose-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-lime-400',
  ][strength]
  const strengthTextColor = [
    'text-rose-400',
    'text-rose-400',
    'text-amber-400',
    'text-lime-400',
    'text-lime-400',
  ][strength]

  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== password

  // ---------------------------------------------------------------
  // Submit — preserves Supabase signUp call + emailSent flow
  // ---------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      toast({
        title: '⚠️ Términos',
        description: 'Debes aceptar términos y privacidad.',
        variant: 'destructive',
      })
      return
    }
    if (!isValidPeruvianPhone(phone)) {
      toast({
        title: '⚠️ Celular inválido',
        description: 'Debe tener 9 dígitos empezando con 9.',
        variant: 'destructive',
      })
      return
    }
    if (confirmPassword !== password) {
      toast({
        title: '⚠️ Contraseñas no coinciden',
        description: 'Verifica que hayas repetido la misma contraseña.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const { error } = await signUp({
      email,
      password,
      displayName: name,
      phone: `+51${phone}`,
    })
    setLoading(false)

    if (error) {
      toast({ title: '❌ Error', description: error, variant: 'destructive' })
      return
    }

    if (isDemoMode) {
      toast({
        title: '🎉 Cuenta demo creada',
        description: 'Modo demo: cualquier email funciona. Configura Supabase para auth real.',
      })
      router.push(ROUTES.dashboard)
      return
    }

    // Real Supabase: user may need to confirm email before they can log in.
    setEmailSent(true)
    toast({
      title: '✉️ Revisa tu correo',
      description: 'Te enviamos un enlace de confirmación. Haz clic para activar tu cuenta.',
    })
  }

  // ---------------------------------------------------------------
  // Success screen — animated green check
  // ---------------------------------------------------------------
  if (emailSent) {
    return <SuccessScreen email={email} />
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col md:flex-row">
        {/* =================================================== */}
        {/* LEFT — Brand panel (desktop only)                   */}
        {/* =================================================== */}
        <aside
          aria-hidden="true"
          className="relative hidden md:flex md:w-[46%] lg:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-500/20 via-fuchsia-900/30 to-background p-12"
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
                <div className="text-[11px] text-muted-foreground -mt-0.5">Subastas en vivo del Perú</div>
              </div>
            </Link>
          </div>

          {/* Hero copy + features */}
          <div className="relative space-y-7">
            <h2 className="text-4xl lg:text-5xl font-black font-display leading-[1.05] tracking-tight">
              Crea tu cuenta.
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-fuchsia-300 bg-clip-text text-transparent">
                Empieza a vender hoy.
              </span>
            </h2>
            <p className="text-muted-foreground/90 text-lg leading-relaxed max-w-md">
              Únete a la comunidad de vendedores y compradores en vivo más grande del Perú. Sin
              mensualidades, sin comisiones ocultas — solo pagas el 5% cuando vendes.
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
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between text-xs text-muted-foreground">
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
            <div className="rounded-3xl border border-border bg-card backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
              {/* Mobile-only logo — imagen oficial /logo.png */}
              <Link href={ROUTES.home} className="mb-6 flex items-center gap-2.5 md:hidden">
                <Image
                  src="/logo.png"
                  alt={`${APP_NAME} — Subastas en vivo del Perú`}
                  width={44}
                  height={44}
                  priority
                  className="rounded-xl object-contain"
                />
                <span className="font-black text-lg font-display text-foreground">{APP_NAME}</span>
              </Link>

              {/* Title */}
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
                    Crea tu cuenta
                  </h1>
                  {isDemoMode && (
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Modo demo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Empieza a pujar y vender en vivo en menos de 5 minutos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Display name */}
                <Field htmlFor="name" label="Nombre completo">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="name"
                    required
                    autoComplete="name"
                    placeholder="Rosa Quispe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(INPUT_CLASS, 'pl-10')}
                  />
                </Field>

                {/* Username */}
                <Field htmlFor="username" label="Usuario" hint="Se usará en tu URL pública: vendeya.pe/vendedores/@rosa.quispe">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    @
                  </span>
                  <input
                    id="username"
                    required
                    autoComplete="username"
                    placeholder="rosa.quispe"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
                    }
                    className={cn(INPUT_CLASS, 'pl-10')}
                  />
                </Field>

                {/* Email */}
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

                {/* Phone */}
                <Field
                  htmlFor="phone"
                  label="Celular"
                  error={
                    phone.length > 0 && !isValidPeruvianPhone(phone)
                      ? 'Debe tener 9 dígitos empezando con 9'
                      : undefined
                  }
                >
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    +51
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className={cn(INPUT_CLASS, 'pl-12 pr-10')}
                  />
                  <Phone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </Field>

                {/* Password */}
                <Field htmlFor="password" label="Contraseña">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex-1 rounded-full transition-colors',
                            i < strength ? strengthColor : 'bg-border'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fortaleza:{' '}
                      <span className={cn('font-semibold', strengthTextColor)}>
                        {strengthLabel}
                      </span>
                    </p>
                  </div>
                )}

                {/* Confirm password */}
                <Field
                  htmlFor="confirmPassword"
                  label="Repetir contraseña"
                  error={
                    passwordMismatch
                      ? 'Las contraseñas no coinciden'
                      : undefined
                  }
                >
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      INPUT_CLASS,
                      'pl-10 pr-10',
                      passwordMismatch && 'border-rose-500/60 focus-visible:border-rose-500/60 focus-visible:ring-rose-500/30'
                    )}
                  />
                  {confirmPassword.length > 0 && !passwordMismatch && (
                    <Check className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lime-400" />
                  )}
                </Field>

                {/* Terms */}
                <label
                  htmlFor="terms"
                  className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed cursor-pointer select-none pt-1"
                >
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-muted accent-amber-400 focus:ring-2 focus:ring-amber-400/40"
                  />
                  <span>
                    Acepto los{' '}
                    <Link href={ROUTES.terminos} className="text-amber-400 hover:text-amber-300 underline">
                      Términos
                    </Link>
                    , la{' '}
                    <Link href={ROUTES.privacidad} className="text-amber-400 hover:text-amber-300 underline">
                      Política de Privacidad
                    </Link>{' '}
                    y recibir notificaciones de subastas por WhatsApp.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-base shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-shadow disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-zinc-950/40 border-t-zinc-950 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Social login — mismo componente que en /login (UX 1:1)
                  Google (multicolor) / Facebook / Apple */}
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
                dividerLabel="o regístrate con"
              />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-3 text-muted-foreground">¿Ya tienes cuenta?</span>
                </div>
              </div>

              <Link
                href={ROUTES.login}
                className="block w-full h-11 rounded-xl bg-muted border border-border hover:bg-accent hover:border-border text-foreground text-sm font-semibold transition-colors flex items-center justify-center"
              >
                Iniciar sesión
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}

// =====================================================================
// Success screen — animated green check
// =====================================================================
function SuccessScreen({ email }: { email: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-border bg-card backdrop-blur-xl p-8 shadow-2xl shadow-black/40 text-center space-y-6"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
          className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-lime-400/20 to-lime-600/30 border-2 border-lime-400/40 flex items-center justify-center shadow-lg shadow-lime-500/30"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          >
            <Check className="h-10 w-10 text-lime-400" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-black font-display tracking-tight text-lime-400">
            Te enviamos un correo de confirmación
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Revisa tu bandeja de entrada en{' '}
            <span className="font-semibold text-foreground">{email}</span> y haz clic en el enlace para
            activar tu cuenta. Solo así podrás iniciar sesión y empezar a pujar en vivo.
          </p>
          <p className="text-xs text-muted-foreground">
            ¿No recibiste el correo? Revisa tu carpeta de spam o espera unos minutos. A veces
            tarda hasta 5 minutos en llegar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="flex flex-col gap-2 pt-2"
        >
          <Link
            href={ROUTES.login}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black text-base shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-shadow flex items-center justify-center gap-2"
          >
            Ya tengo cuenta — Iniciar sesión
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href={ROUTES.home}
            className="w-full h-11 rounded-xl bg-muted border border-border hover:bg-accent hover:border-border text-foreground text-sm font-semibold transition-colors flex items-center justify-center"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}

// =====================================================================
// Sub-components — hoisted to module level
// =====================================================================

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">{children}</div>
      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
