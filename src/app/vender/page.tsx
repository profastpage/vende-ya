'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles, Video, Radio, Tag, ArrowRight, ArrowLeft, ChevronRight,
  Loader2, Check, Image as ImageIcon, DollarSign, Package, Wallet,
  ShieldCheck, Plug, ChevronRight as ChevronR, Plus, Rocket,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createKickStream } from './actions'
import { ROUTES } from '@/lib/vendeda/routes'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/vendeda/constants'
import { formatPEN } from '@/lib/vendeda/format'
import { cn } from '@/lib/utils'

type Mode = 'quick' | 'live' | 'ai'

const PAGE_TITLE = 'Vender'
const STEPS = [
  {
    n: 1,
    icon: Wallet,
    title: 'Conecta tu wallet MP',
    desc: 'Vincula tu cuenta de Mercado Pago para recibir pagos con Yape, Plin, tarjetas y PagoEfectivo. La comisiÃƒÆ’Ã‚Â³n de Vende Ya se descuenta automÃƒÆ’Ã‚Â¡ticamente en la fuente.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'from-amber-200/50 to-amber-100/30 dark:from-amber-400/15 dark:to-amber-500/5',
  },
  {
    n: 2,
    icon: Package,
    title: 'Crea tu producto',
    desc: 'Sube fotos, define el precio base y describe el producto. Si quieres subastarlo, marca la casilla y fija el precio inicial y la duraciÃƒÆ’Ã‚Â³n del cronÃƒÆ’Ã‚Â³metro.',
    color: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'from-fuchsia-200/50 to-fuchsia-100/30 dark:from-fuchsia-400/15 dark:to-fuchsia-500/5',
  },
  {
    n: 3,
    icon: Radio,
    title: 'Inicia tu en vivo',
    desc: 'Genera tu clave de stream para OBS Studio y comienza a transmitir. Los espectadores pujan en tiempo real con latencia menor a 2 segundos vÃƒÆ’Ã‚Â­a Cloudflare Stream.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'from-rose-200/50 to-rose-100/30 dark:from-rose-400/15 dark:to-rose-500/5',
  },
] as const

export default function VenderPage() {
  return (
    <AuthGuard>
      <React.Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-border border-t-amber-400 animate-spin" />
        </div>
      }>
        <VenderInner />
      </React.Suspense>
    </AuthGuard>
  )
}

function VenderInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const initialMode = (searchParams.get('mode') as Mode) ?? 'quick'

  const [mode, setMode] = React.useState<Mode>(initialMode)
  const [aiInput, setAiInput] = React.useState('')
  const [aiLoading, setAiLoading] = React.useState(false)
  const [extracted, setExtracted] = React.useState<{
    title: string; description: string; suggestedPrice: number;
    suggestedCategory: string; condition: string;
  } | null>(null)

  // Form state
  const [title, setTitle] = React.useState('')
  const [kickUsername, setKickUsername] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [condition, setCondition] = React.useState('nuevo')
  const [stock, setStock] = React.useState('1')
  const [paymentMethods, setPaymentMethods] = React.useState<string[]>(['yape', 'plin'])
  const [shippingCost, setShippingCost] = React.useState('10')
  const [isAuction, setIsAuction] = React.useState(true)
  const [startingPrice, setStartingPrice] = React.useState('')
  const [duration, setDuration] = React.useState('180')
  const [submitting, setSubmitting] = React.useState(false)

  // Wallet status (drives hero CTA + banner)
  const [wallet, setWallet] = React.useState<{
    loading: boolean
    status: string | null
    isVerified: boolean | null
  }>({ loading: true, status: null, isVerified: null })

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.wallet) {
          setWallet({
            loading: false,
            status: data.wallet.status,
            isVerified: data.wallet.isVerified,
          })
        } else {
          setWallet({ loading: false, status: null, isVerified: null })
        }
      })
      .catch(() => setWallet({ loading: false, status: null, isVerified: null }))
  }, [])

  const walletConnected =
    !wallet.loading && wallet.status === 'active' && wallet.isVerified === true

  const handleExtract = async () => {
    if (!aiInput.trim()) {
      toast({ title: 'ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Describe tu producto', variant: 'destructive' })
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput }),
      })
      const data = await res.json()
      setExtracted(data)
      // Pre-fill the form
      setTitle(data.title)
      setDescription(data.description)
      setPrice(String(data.suggestedPrice))
      setCategory(data.suggestedCategory)
      setCondition(data.condition)
      if (isAuction) setStartingPrice(String(Math.round(data.suggestedPrice * 0.3)))
      toast({
        title: 'ÃƒÂ¢Ã…â€œÃ‚Â¨ Producto extraÃƒÆ’Ã‚Â­do con IA',
        description: `Sugerencia: ${data.title} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â S/. ${data.suggestedPrice}`,
      })
      setMode('quick') // Switch to the form
    } catch (err) {
      toast({ title: 'ÃƒÂ¢Ã‚ÂÃ…â€™ Error de IA', description: 'Intenta de nuevo.', variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const togglePayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !price || !kickUsername) {
      toast({ title: 'Error', description: 'Todos los campos son obligatorios, incluyendo tu usuario de Kick.', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await createKickStream(title, kickUsername, isAuction, Number(price))
      toast({ title: 'Ãƒâ€šÃ‚Â¡En Vivo!', description: 'Tu transmisiÃƒÆ’Ã‚Â³n de Kick ha sido enlazada a Vende Ya exitosamente.' })
      router.push('/')
    } catch(err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
    return;
    /*
    e.preventDefault()
    if (!title || !price) {
      toast({ title: 'ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Faltan campos', description: 'TÃƒÆ’Ã‚Â­tulo y precio son obligatorios.', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast({
      title: isAuction ? 'ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â° Subasta creada' : 'ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â° Producto publicado',
      description: isAuction
        ? 'Tu subasta estÃƒÆ’Ã‚Â¡ activa. Ãƒâ€šÃ‚Â¡Comparte el enlace!'
        : 'Tu producto ya estÃƒÆ’Ã‚Â¡ en el marketplace.',
    })
    router.push(ROUTES.dashboard)
  }*/
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border pt-safe">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href={ROUTES.dashboard} aria-label="Volver" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold font-display truncate text-foreground">{PAGE_TITLE}</h1>
            <p className="text-[10px] text-muted-foreground truncate">Empieza a vender en vivo</p>
          </div>
        </div>
      </header>

      {/* Desktop breadcrumb bar */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href={ROUTES.home} className="hover:text-foreground">Inicio</Link>
          <ChevronRight className="h-3 w-3 mx-1" />
          <span className="text-foreground font-medium">{PAGE_TITLE}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">
        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Hero ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-background to-background p-6 md:p-10"
        >
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-amber-400 mb-4">
              <Rocket className="h-3.5 w-3.5" />
              Programa de vendedores Ãƒâ€šÃ‚Â· Dark Premium
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-foreground leading-tight">
              Empieza a vender <span className="bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-transparent">en vivo</span>.
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              Conecta tu billetera de Mercado Pago, crea tu producto y empieza a transmitir en menos de cinco minutos.
              Los compradores pujan en tiempo real con Yape, Plin, tarjetas o PagoEfectivo. Vende Ya retiene
              su comisiÃƒÆ’Ã‚Â³n automÃƒÆ’Ã‚Â¡ticamente (12% en vivo / 8% marketplace) y tÃƒÆ’Ã‚Âº recibes el neto en tu cuenta.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              No necesitas programar ni integrar APIs de pago: el split de comisiones ocurre en la fuente de Mercado Pago.
              Si tu cliente no paga, la subasta se reabre automÃƒÆ’Ã‚Â¡ticamente y el siguiente postor gana.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {!walletConnected ? (
                <a
                  href="/api/wallet/oauth/redirect"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold text-sm shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95"
                >
                  <Plug className="h-4 w-4" /> Conectar Mercado Pago
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <a
                  href="#producto"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold text-sm shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Crear producto
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <Link
                href="/wallet"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-medium text-sm transition-all"
              >
                <Wallet className="h-4 w-4 text-amber-400" /> Ver estado de wallet
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Wallet status banner ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <WalletStatusBanner
          loading={wallet.loading}
          connected={walletConnected}
          status={wallet.status}
        />

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3-step process cards ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-foreground">3 pasos para vender en vivo</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sigue esta secuencia y estarÃƒÆ’Ã‚Â¡s transmitiendo tu primera subasta antes de que termines tu cafÃƒÆ’Ã‚Â©.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6',
                  'hover:border-border transition-colors'
                )}
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', step.bg)} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center">
                      <step.icon className={cn('h-5 w-5', step.color)} />
                    </div>
                    <span className="text-4xl font-black font-display text-foreground/5 tabular-nums">
                      {String(step.n).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Mode selector ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">Ãƒâ€šÃ‚Â¿CÃƒÆ’Ã‚Â³mo quieres empezar?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Elige el modo que mejor se ajuste a tu inventario y a tu estilo de venta.
            Puedes cambiar de modo en cualquier momento sin perder lo que ya diligenciaste.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ModeCard
              active={mode === 'quick'}
              onClick={() => setMode('quick')}
              icon={Tag}
              title="Subasta rÃƒÆ’Ã‚Â¡pida"
              desc="Publica y subasta en 3 minutos"
              color="text-amber-400"
            />
            <ModeCard
              active={mode === 'live'}
              onClick={() => setMode('live')}
              icon={Video}
              title="Subastar en vivo"
              desc="Conecta tu cÃƒÆ’Ã‚Â¡mara y subasta en directo"
              color="text-fuchsia-400"
            />
            <ModeCard
              active={mode === 'ai'}
              onClick={() => setMode('ai')}
              icon={Sparkles}
              title="Extraer con IA"
              desc="Describe y la IA arma el listing"
              color="text-purple-400"
            />
          </div>
        </section>

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ AI extraction mode ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        {mode === 'ai' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className="font-bold text-foreground">Describe tu producto en lenguaje natural</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Escribe como si le hablaras a un amigo. La IA extrae tÃƒÆ’Ã‚Â­tulo, descripciÃƒÆ’Ã‚Â³n, precio sugerido y categorÃƒÆ’Ã‚Â­a automÃƒÆ’Ã‚Â¡ticamente.
              El modelo usa un fine-tune sobre catÃƒÆ’Ã‚Â¡logos peruanos para reconocer Yape, Plin, Olva, Shalom y los departamentos.
            </p>
            <Textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Tengo un polo de algodÃƒÆ’Ã‚Â³n pima peruano, talla M, color terracota. Es nuevo con etiqueta. Lo comprÃƒÆ’Ã‚Â© en Lima pero no me quedÃƒÆ’Ã‚Â³. Quiero venderlo rÃƒÆ’Ã‚Â¡pido, unos 40 soles."
              rows={5}
              className="mb-3 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-purple-400/40"
            />
            <Button
              onClick={handleExtract}
              disabled={aiLoading || !aiInput.trim()}
              className="w-full h-11 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-foreground border-0"
            >
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Extrayendo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Extraer con IA
                </span>
              )}
            </Button>

            {extracted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-xl bg-purple-400/10 border border-purple-400/30"
              >
                <p className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4" /> ExtracciÃƒÆ’Ã‚Â³n exitosa
                </p>
                <div className="text-xs space-y-1 text-purple-200">
                  <p><strong className="text-purple-100">TÃƒÆ’Ã‚Â­tulo:</strong> {extracted.title}</p>
                  <p><strong className="text-purple-100">Precio sugerido:</strong> {formatPEN(extracted.suggestedPrice)}</p>
                  <p><strong className="text-purple-100">CategorÃƒÆ’Ã‚Â­a:</strong> {extracted.suggestedCategory}</p>
                  <p><strong className="text-purple-100">CondiciÃƒÆ’Ã‚Â³n:</strong> {extracted.condition}</p>
                </div>
                <p className="text-xs text-purple-300/80 mt-2">
                  ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“ Revisa y edita el formulario abajo antes de publicar
                </p>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Live stream setup ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        {mode === 'live' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
                <Video className="h-4 w-4 text-rose-400" />
              </div>
              <h3 className="font-bold text-foreground">Configura tu transmisiÃƒÆ’Ã‚Â³n en vivo</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl bg-muted border border-border p-4 text-sm">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¡ CÃƒÆ’Ã‚Â³mo funciona
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                  <li>RecibirÃƒÆ’Ã‚Â¡s una <strong className="text-amber-700 dark:text-amber-300">clave de stream</strong> ÃƒÆ’Ã‚Âºnica (ej. para OBS Studio).</li>
                  <li>Configura OBS con: <code className="bg-amber-100 dark:bg-black/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-xs">rtmp://stream.vendeya.pe/live</code></li>
                  <li>Pega tu clave de stream y empieza a transmitir desde tu cÃƒÆ’Ã‚Â¡mara o celular.</li>
                  <li>Los viewers ven el stream con ~2s de latencia vÃƒÆ’Ã‚Â­a Cloudflare Stream y pueden pujar en vivo.</li>
                </ol>
              </div>
              <Button className="w-full h-11 bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold border-0">
                <Video className="h-4 w-4 mr-2" /> Generar clave de stream y empezar
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Recomendamos resoluciÃƒÆ’Ã‚Â³n 720p @ 30fps y bitrate entre 2500ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“4000 kbps para estabilidad mÃƒÆ’Ã‚Â³vil.
              </p>
            </div>
          </motion.section>
        )}

        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main form ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
        <section id="producto" className="scroll-mt-20">
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">Detalles del producto</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Completa los campos obligatorios marcados con asterisco. Cuanta mÃƒÆ’Ã‚Â¡s informaciÃƒÆ’Ã‚Â³n des, mayor serÃƒÆ’Ã‚Â¡ la conversiÃƒÆ’Ã‚Â³n.
            Las fotos son la primera impresiÃƒÆ’Ã‚Â³n del comprador: usa luz natural y muestra detalles del producto.
          </p>
          <form className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold text-foreground">InformaciÃƒÆ’Ã‚Â³n principal</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground">TÃƒÆ’Ã‚Â­tulo *</Label>
              <Input
                id="title" required placeholder="Polo algodÃƒÆ’Ã‚Â³n pima ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ediciÃƒÆ’Ã‚Â³n Lima"
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">DescripciÃƒÆ’Ã‚Â³n</Label>
              <Textarea
                id="description" rows={4}
                placeholder="Describe materiales, tallas, colores disponibles, condiciÃƒÆ’Ã‚Â³n, etc."
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-muted-foreground">Precio base (S/.) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price" type="number" required min="0" step="0.5"
                    placeholder="40.00"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="pl-10 h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-muted-foreground">Stock disponible</Label>
                <Input
                  id="stock" type="number" min="1"
                  value={stock} onChange={(e) => setStock(e.target.value)}
                  className="h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-muted-foreground">CategorÃƒÆ’Ã‚Â­a</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 rounded-md border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                >
                  <option value="" className="bg-card">Selecciona...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug} className="bg-card">{c.nameEs}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-muted-foreground">CondiciÃƒÆ’Ã‚Â³n</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-12 rounded-md border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                >
                  <option value="nuevo" className="bg-card">Nuevo</option>
                  <option value="usado-como-nuevo" className="bg-card">Usado - como nuevo</option>
                  <option value="usado-bueno" className="bg-card">Usado - bueno</option>
                  <option value="usado-aceptable" className="bg-card">Usado - aceptable</option>
                </select>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Fotos</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                <button
                  type="button"
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted hover:border-amber-400/40 transition-colors"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">Subir</span>
                </button>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground"
                  >
                    Foto {i}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Hasta 8 fotos. Primera foto = portada.</p>
            </div>

            {/* Auction toggle */}
            <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAuction}
                  onChange={(e) => setIsAuction(e.target.checked)}
                  className="h-4 w-4 accent-amber-400"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Subastar este producto</p>
                  <p className="text-xs text-muted-foreground">Si activas, los usuarios pujan en tiempo real durante tu en vivo.</p>
                </div>
              </label>

              {isAuction && (
                <div className="grid grid-cols-2 gap-3 pl-7">
                  <div className="space-y-2">
                    <Label htmlFor="starting" className="text-muted-foreground">Precio inicial (S/.)</Label>
                    <Input
                      id="starting" type="number" min="1" step="1"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-muted-foreground">DuraciÃƒÆ’Ã‚Â³n</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    >
                      <option value="60" className="bg-card">1 minuto</option>
                      <option value="180" className="bg-card">3 minutos</option>
                      <option value="300" className="bg-card">5 minutos</option>
                      <option value="600" className="bg-card">10 minutos</option>
                      <option value="1800" className="bg-card">30 minutos</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Payment methods */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">MÃƒÆ’Ã‚Â©todos de pago aceptados</Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(PAYMENT_METHODS).map((pm) => {
                  const active = paymentMethods.includes(pm.id)
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => togglePayment(pm.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                        active
                          ? 'border-amber-400/50 bg-amber-400/10 text-amber-700 dark:text-amber-300'
                          : 'border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {pm.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Mercado Pago procesa Yape, Plin, tarjetas y PagoEfectivo en una sola API.
              </p>
            </div>

            {/* Shipping */}
            <div className="space-y-2">
              <Label htmlFor="shipping" className="text-muted-foreground">Costo de envÃƒÆ’Ã‚Â­o (S/. / 0 = gratis)</Label>
              <Input
                id="shipping" type="number" min="0" step="0.5"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 text-base font-bold gap-2 border-0 shadow-lg shadow-fuchsia-500/30"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Publicando...
                </span>
              ) : (
                <>
                  {isAuction ? 'ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â° Iniciar subasta' : 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦ Publicar producto'} <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Al publicar aceptas los{' '}
              <Link href={ROUTES.terminos} className="underline hover:text-muted-foreground">TÃƒÆ’Ã‚Â©rminos</Link> y la{' '}
              <Link href={ROUTES.privacidad} className="underline hover:text-muted-foreground">PolÃƒÆ’Ã‚Â­tica de Privacidad</Link>.
            </p>
          </form>
        </section>
      </main>
    </div>
  )
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// ModeCard ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â dark premium variant
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function ModeCard({
  active, onClick, icon: Icon, title, desc, color,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  title: string
  desc: string
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left p-5 rounded-2xl border transition-all',
        active
          ? 'border-amber-400/40 bg-amber-400/5 ring-1 ring-amber-400/20'
          : 'border-border bg-card/80 hover:border-border/60 hover:bg-card'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        {active && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-400/15 border border-amber-300 dark:border-amber-400/30 px-2 py-0.5 rounded-full">
            <Check className="h-2.5 w-2.5" /> ACTIVO
          </span>
        )}
      </div>
      <div className="font-bold text-foreground text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
    </button>
  )
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Wallet status banner ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â preserved from Sprint 2-A
// Drives hero CTA + step preview
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function WalletStatusBanner({
  loading,
  connected,
  status,
}: {
  loading: boolean
  connected: boolean
  status: string | null
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 animate-pulse">
        <div className="h-4 w-1/3 bg-muted rounded mb-3" />
        <div className="h-3 w-2/3 bg-muted rounded mb-2" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
    )
  }

  if (connected) {
    // Connected ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â show "prÃƒÆ’Ã‚Â³ximos pasos" preview
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-lime-400/30 bg-lime-400/10 backdrop-blur-sm p-6"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-lime-400/15 border border-lime-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-lime-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lime-200 mb-1">Tu Mercado Pago estÃƒÆ’Ã‚Â¡ conectado y verificado</p>
            <p className="text-sm text-lime-200/80 leading-relaxed mb-4">
              RecibirÃƒÆ’Ã‚Â¡s los pagos automÃƒÆ’Ã‚Â¡ticamente en tu cuenta. La comisiÃƒÆ’Ã‚Â³n de Vende Ya (12% en vivo / 8% marketplace)
              se descuenta en la fuente vÃƒÆ’Ã‚Â­a split payment de Mercado Pago. Ya puedes publicar productos y empezar a transmitir.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-black/30 border border-lime-400/20 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-lime-200 mb-1">
                  <span className="h-5 w-5 rounded-full bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-[10px]">1</span>
                  Crea tu producto
                </div>
                <p className="text-[11px] text-lime-200/70">Completa el formulario de abajo con fotos y precio base.</p>
              </div>
              <div className="rounded-xl bg-black/30 border border-lime-400/20 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-lime-200 mb-1">
                  <span className="h-5 w-5 rounded-full bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-[10px]">2</span>
                  Activa la subasta
                </div>
                <p className="text-[11px] text-lime-200/70">Marca la casilla y fija precio inicial + duraciÃƒÆ’Ã‚Â³n del cronÃƒÆ’Ã‚Â³metro.</p>
              </div>
              <div className="rounded-xl bg-black/30 border border-lime-400/20 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-lime-200 mb-1">
                  <span className="h-5 w-5 rounded-full bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-[10px]">3</span>
                  Inicia tu en vivo
                </div>
                <p className="text-[11px] text-lime-200/70">Genera la clave de stream y empieza a transmitir en OBS Studio.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="#producto"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-lime-400/20 hover:bg-lime-400/30 border border-lime-400/40 text-lime-100 text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" /> Crear producto ahora
              </Link>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-muted hover:bg-accent border border-border text-foreground text-sm font-medium transition-colors"
              >
                Ver mi billetera <ChevronR className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    )
  }

  // Not connected ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â amber warning + CTA
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10 backdrop-blur-sm p-6"
    >
      <div className="hidden dark:block absolute right-[-30px] top-[-30px] w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-amber-200 dark:bg-amber-400/15 border border-amber-300 dark:border-amber-400/30 flex items-center justify-center shrink-0">
            {/* Mercado Pago logo placeholder */}
            <span className="text-amber-700 dark:text-amber-300 font-black text-xs leading-none">MP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
              Conecta tu Mercado Pago para empezar a vender
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-900 dark:text-amber-200/80 leading-relaxed">
              Antes de publicar, vincula tu cuenta de Mercado Pago. RecibirÃƒÆ’Ã‚Â¡s pagos con Yape, Plin y tarjetas.
              Vende Ya retiene automÃƒÆ’Ã‚Â¡ticamente su comisiÃƒÆ’Ã‚Â³n (12% en vivo, 8% marketplace) y tÃƒÆ’Ã‚Âº recibes el neto exacto.
              Sin KYC completo los pagos quedan retenidos hasta 7 dÃƒÆ’Ã‚Â­as, asÃƒÆ’Ã‚Â­ que completa la verificaciÃƒÆ’Ã‚Â³n cuanto antes.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-900 dark:text-amber-200/60 mt-2">
              Estado actual:{' '}
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                {status === 'pending' ? 'VerificaciÃƒÆ’Ã‚Â³n pendiente' : 'No conectada'}
              </span>
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <a
            href="/api/wallet/oauth/redirect"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 hover:from-amber-500 hover:to-fuchsia-700 text-zinc-950 font-bold text-sm shadow-lg shadow-fuchsia-500/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plug className="h-4 w-4" /> Conectar Mercado Pago
          </a>
        </div>
      </div>
    </motion.section>
  )
}