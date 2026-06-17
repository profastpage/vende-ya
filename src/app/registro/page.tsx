'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'
import { isValidPeruvianPhone } from '@/lib/vendeda/format'

export default function RegistroPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signUp, isDemoMode } = useAuth()
  const [name, setName] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [acceptTerms, setAcceptTerms] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const strength = React.useMemo(() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s // 0..4
  }, [password])

  const strengthLabel = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'][strength]
  const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-lima-500', 'bg-lima-600'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      toast({ title: '⚠️ Términos', description: 'Debes aceptar términos y privacidad.', variant: 'destructive' })
      return
    }
    if (!isValidPeruvianPhone(phone)) {
      toast({ title: '⚠️ Celular inválido', description: 'Debe tener 9 dígitos empezando con 9.', variant: 'destructive' })
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
    toast({
      title: '🎉 Cuenta creada',
      description: isDemoMode
        ? 'Cuenta demo activa. Configura Supabase para auth real.'
        : 'Te enviamos un email de confirmación. Revisa tu bandeja.',
    })
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Link href={ROUTES.home} className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center shadow-glow-salsa">
              <span className="text-white font-bold text-xl">V</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            Crea tu cuenta
            {isDemoMode && (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                Modo demo
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ¿Ya tienes cuenta?{' '}
            <Link href={ROUTES.login} className="text-salsa-600 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-2xl border shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name" required placeholder="Rosa Quispe"
                value={name} onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="username" required placeholder="rosa.quispe"
                value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email" type="email" required placeholder="tucorreo@ejemplo.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Celular</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+51</span>
              <Input
                id="phone" type="tel" required placeholder="987654321"
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="pl-12 h-12"
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {phone.length > 0 && !isValidPeruvianPhone(phone) && (
              <p className="text-xs text-destructive">Debe tener 9 dígitos empezando con 9</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password" type={showPassword ? 'text' : 'password'} required
                placeholder="Mínimo 8 caracteres"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1 h-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${
                        i < strength ? strengthColor : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fortaleza: <span className="font-medium">{strengthLabel}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-xs cursor-pointer leading-relaxed">
              Acepto los{' '}
              <Link href={ROUTES.terminos} className="text-salsa-600 hover:underline">Términos</Link>, la{' '}
              <Link href={ROUTES.privacidad} className="text-salsa-600 hover:underline">Política de Privacidad</Link>{' '}
              y recibir notificaciones de subastas por WhatsApp.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-salsa-500 hover:bg-salsa-600 text-white text-base font-bold gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              <>Crear cuenta <ArrowRight className="h-5 w-5" /></>
            )}
          </Button>
        </form>

        <div className="bg-lima-50 border border-lima-200 rounded-xl p-4 text-sm text-lima-900">
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-lima-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">¿Qué incluye tu cuenta gratis?</p>
              <ul className="text-xs space-y-0.5 text-lima-800">
                <li>✓ Pujar en subastas en vivo ilimitadas</li>
                <li>✓ Vender productos y organizar tus propias subastas</li>
                <li>✓ Paga con Yape, Plin, PagoEfectivo o tarjeta</li>
                <li>✓ Chat directo con vendedores y soporte</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
