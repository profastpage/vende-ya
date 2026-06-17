'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Sparkles, Video, Radio, Tag, ArrowRight, Loader2, Check,
  Image as ImageIcon, DollarSign, Package, Settings,
} from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/vendeda/routes'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/vendeda/constants'
import { formatPEN } from '@/lib/vendeda/format'

const breadcrumbs: Breadcrumb[] = [{ label: 'Vender' }]

type Mode = 'quick' | 'live' | 'ai'

export default function VenderPage() {
  return (
    <AuthGuard>
      <AppShell title="Vender" breadcrumbs={breadcrumbs} maxWidth="max-w-4xl">
        <React.Suspense fallback={<Card className="p-8 text-center text-muted-foreground">Cargando...</Card>}>
          <VenderInner />
        </React.Suspense>
      </AppShell>
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

  const handleExtract = async () => {
    if (!aiInput.trim()) {
      toast({ title: '⚠️ Describe tu producto', variant: 'destructive' })
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
        title: '✨ Producto extraído con IA',
        description: `Sugerencia: ${data.title} — S/. ${data.suggestedPrice}`,
      })
      setMode('quick') // Switch to the form
    } catch (err) {
      toast({ title: '❌ Error de IA', description: 'Intenta de nuevo.', variant: 'destructive' })
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
    if (!title || !price) {
      toast({ title: '⚠️ Faltan campos', description: 'Título y precio son obligatorios.', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    toast({
      title: isAuction ? '🎉 Subasta creada' : '🎉 Producto publicado',
      description: isAuction
        ? 'Tu subasta está activa. ¡Comparte el enlace!'
        : 'Tu producto ya está en el marketplace.',
    })
    router.push(ROUTES.dashboard)
  }

  return (
    <>
      {/* Mode selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <ModeCard
          active={mode === 'quick'}
          onClick={() => setMode('quick')}
          icon={Tag}
          title="Subasta rápida"
          desc="Publica y subasta en 3 min"
          color="text-salsa-500"
        />
        <ModeCard
          active={mode === 'live'}
          onClick={() => setMode('live')}
          icon={Video}
          title="Subastar en vivo"
          desc="Conecta tu cámara y subasta en directo"
          color="text-salsa-500"
        />
        <ModeCard
          active={mode === 'ai'}
          onClick={() => setMode('ai')}
          icon={Sparkles}
          title="Extraer con IA"
          desc="Describe y la IA arma el listing"
          color="text-lima-500"
        />
      </div>

      {/* AI extraction mode */}
      {mode === 'ai' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-lima-500" />
            <h3 className="font-semibold">Describe tu producto en lenguaje natural</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Escribe como si le hablaras a un amigo. La IA extrae título, descripción, precio sugerido y categoría automáticamente.
          </p>
          <Textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Tengo un polo de algodón pima peruano, talla M, color terracota. Es nuevo con etiqueta. Lo compré en Lima pero no me quedó. Quiero venderlo rápido, unos 40 soles."
            rows={5}
            className="mb-3"
          />
          <Button
            onClick={handleExtract}
            disabled={aiLoading || !aiInput.trim()}
            className="w-full bg-lima-500 hover:bg-lima-600 text-white"
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
            <div className="mt-4 p-4 rounded-lg bg-lima-50 border border-lima-200">
              <p className="text-sm font-semibold text-lima-900 mb-2 flex items-center gap-2">
                <Check className="h-4 w-4" /> Extracción exitosa
              </p>
              <div className="text-xs space-y-1 text-lima-800">
                <p><strong>Título:</strong> {extracted.title}</p>
                <p><strong>Precio sugerido:</strong> {formatPEN(extracted.suggestedPrice)}</p>
                <p><strong>Categoría:</strong> {extracted.suggestedCategory}</p>
                <p><strong>Condición:</strong> {extracted.condition}</p>
              </div>
              <p className="text-xs text-lima-700 mt-2">
                ↓ Revisa y edita el formulario abajo antes de publicar
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Live stream setup */}
      {mode === 'live' && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-5 w-5 text-salsa-500" />
            <h3 className="font-semibold">Configura tu transmisión en vivo</h3>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-salsa-50 border border-salsa-200 p-4 text-sm">
              <p className="font-semibold text-salsa-900 mb-2">📡 Cómo funciona</p>
              <ol className="list-decimal list-inside space-y-1 text-salsa-800">
                <li>Recibirás una <strong>clave de stream</strong> única (ej. para OBS Studio)</li>
                <li>Configura OBS con: <code className="bg-white px-1 rounded">rtmp://stream.vendeya.pe/live</code></li>
                <li>Pega tu clave de stream y empieza a transmitir</li>
                <li>Los viewers ven el stream con ~2s de latencia vía Cloudflare Stream</li>
              </ol>
            </div>
            <Button className="w-full bg-salsa-500 hover:bg-salsa-600 text-white">
              <Video className="h-4 w-4 mr-2" /> Generar clave de stream y empezar
            </Button>
          </div>
        </Card>
      )}

      {/* Main form */}
      <Card className="p-6 space-y-5">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-salsa-500" /> Detalles del producto
        </h3>

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title" required placeholder="Polo algodón pima — edición Lima"
            value={title} onChange={(e) => setTitle(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description" rows={4}
            placeholder="Describe materiales, tallas, colores disponibles, condición, etc."
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Precio base (S/.) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price" type="number" required min="0" step="0.5"
                placeholder="40.00"
                value={price} onChange={(e) => setPrice(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock disponible</Label>
            <Input
              id="stock" type="number" min="1"
              value={stock} onChange={(e) => setStock(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Selecciona...</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>{c.nameEs}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condición</Label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-12 rounded-md border bg-background px-3 text-sm"
            >
              <option value="nuevo">Nuevo</option>
              <option value="usado-como-nuevo">Usado - como nuevo</option>
              <option value="usado-bueno">Usado - bueno</option>
              <option value="usado-aceptable">Usado - aceptable</option>
            </select>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label>Fotos</Label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 hover:border-salsa-300 transition-colors">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">Subir</span>
            </button>
            {[1, 2].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                Foto {i}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Hasta 8 fotos. Primera foto = portada.</p>
        </div>

        {/* Auction toggle */}
        <div className="rounded-lg border p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAuction}
              onChange={(e) => setIsAuction(e.target.checked)}
              className="h-4 w-4 accent-salsa-500"
            />
            <div>
              <p className="text-sm font-semibold">Subastar este producto</p>
              <p className="text-xs text-muted-foreground">Si activas, los usuarios pujan en tiempo real</p>
            </div>
          </label>

          {isAuction && (
            <div className="grid grid-cols-2 gap-3 pl-7">
              <div className="space-y-2">
                <Label htmlFor="starting">Precio inicial (S/.)</Label>
                <Input
                  id="starting" type="number" min="1" step="1"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="h-10"
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (segundos)</Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="60">1 minuto</option>
                  <option value="180">3 minutos</option>
                  <option value="300">5 minutos</option>
                  <option value="600">10 minutos</option>
                  <option value="1800">30 minutos</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Payment methods */}
        <div className="space-y-2">
          <Label>Métodos de pago aceptados</Label>
          <div className="flex flex-wrap gap-2">
            {Object.values(PAYMENT_METHODS).map((pm) => {
              const active = paymentMethods.includes(pm.id)
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => togglePayment(pm.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    active
                      ? 'border-salsa-500 bg-salsa-50 text-salsa-700'
                      : 'border-input bg-background hover:bg-muted'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {pm.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Shipping */}
        <div className="space-y-2">
          <Label htmlFor="shipping">Costo de envío (S/. / 0 = gratis)</Label>
          <Input
            id="shipping" type="number" min="0" step="0.5"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="h-12"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-salsa-500 hover:bg-salsa-600 text-white text-base font-bold gap-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Publicando...
            </span>
          ) : (
            <>
              {isAuction ? '🎉 Iniciar subasta' : '📦 Publicar producto'} <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </Card>
    </>
  )
}

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
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        active ? 'border-salsa-500 bg-salsa-50 shadow-glow-salsa' : 'border-border bg-card hover:border-salsa-300'
      }`}
    >
      <Icon className={`h-6 w-6 mb-2 ${color}`} />
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </button>
  )
}
