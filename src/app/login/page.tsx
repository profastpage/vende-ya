'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = React.useState<'email' | 'phone'>('email')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulated auth (in prod: Supabase auth.signInWithPassword)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast({
      title: '✅ Sesión iniciada',
      description: 'Bienvenido de vuelta a Vende Ya.',
    })
    router.push(ROUTES.dashboard)
  }

  const handleSocial = (provider: 'google' | 'facebook' | 'apple') => {
    toast({
      title: `🔐 Auth con ${provider}`,
      description: 'En producción, esto abre OAuth del proveedor.',
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left: brand panel (desktop) */}
      <div className="hidden md:flex md:flex-1 bg-gradient-to-br from-salsa-500 via-salsa-600 to-salsa-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-80 h-80 rounded-full bg-lima-300 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-plin-500 blur-3xl" />
        </div>
        <div className="relative">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="font-bold text-2xl font-display">{APP_NAME}</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold font-display leading-tight">
            Subasta en vivo.<br />Compra ya. Vende ya.
          </h2>
          <p className="text-white/80 text-lg">
            El marketplace social del Perú. Paga con Yape, Plin o PagoEfectivo. Envíos a todo el país.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-xs text-white/70">Usuarios activos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">S/. 2M</div>
              <div className="text-xs text-white/70">Vendidos en vivo</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-xs text-white/70">Rating</div>
            </div>
          </div>
        </div>
        <div className="relative text-xs text-white/60">
          © 2026 Vende Ya · Hecho en Perú 🇵🇪
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left">
            <Link href={ROUTES.home} className="md:hidden inline-flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold font-display">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ¿No tienes cuenta?{' '}
              <Link href={ROUTES.registro} className="text-salsa-600 hover:underline font-medium">
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => setMode('email')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'email' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setMode('phone')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'phone' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <Smartphone className="h-4 w-4" /> Celular
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Número de celular</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+51</span>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    pattern="9\d{8}"
                    placeholder="987654321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12 h-12"
                    maxLength={9}
                  />
                  <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">9 dígitos, empezando con 9</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="#" className="text-xs text-salsa-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              <Label htmlFor="remember" className="text-sm cursor-pointer">Mantener sesión iniciada</Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-salsa-500 hover:bg-salsa-600 text-white text-base font-bold gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Entrando...
                </span>
              ) : (
                <>Entrar <ArrowRight className="h-5 w-5" /></>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o continúa con</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => handleSocial('google')} className="h-12">
              <span className="text-xs font-semibold">Google</span>
            </Button>
            <Button variant="outline" onClick={() => handleSocial('facebook')} className="h-12">
              <span className="text-xs font-semibold">Facebook</span>
            </Button>
            <Button variant="outline" onClick={() => handleSocial('apple')} className="h-12">
              <span className="text-xs font-semibold">Apple</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Al continuar aceptas los{' '}
            <Link href={ROUTES.terminos} className="underline hover:text-foreground">Términos</Link> y la{' '}
            <Link href={ROUTES.privacidad} className="underline hover:text-foreground">Privacidad</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
