'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Loader2, Upload, FileText, AlertTriangle,
  ArrowLeft, ExternalLink,
} from 'lucide-react'
import {
  StaticPageShell,
  PageHeader,
  DarkInput,
  DarkTextarea,
  DarkLabel,
  DarkSelect,
  GradientButton,
  GhostButton,
} from '@/components/vendeda/StaticPageShell'
import { useToast } from '@/hooks/use-toast'

const REASONS = [
  { value: 'counterfeit', label: 'Producto falsificado / réplica no declarada' },
  { value: 'trademark', label: 'Infracción de marca registrada' },
  { value: 'copyright', label: 'Infracción de derechos de autor' },
  { value: 'stolen', label: 'Producto robado o reportado como tal' },
  { value: 'prohibited', label: 'Producto prohibido por ley peruana' },
  { value: 'other', label: 'Otro (especificar en descripción)' },
] as const

export default function ReportarInfraccionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    reporterEmail: '',
    targetSellerId: '',
    targetOrderOrStreamId: '',
    infringedBrand: '',
    evidenceUrl: '',
    reason: '' as (typeof REASONS)[number]['value'] | '',
    description: '',
  })
  const [fileName, setFileName] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/copyright-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el reporte')

      toast({
        title: 'Reporte enviado',
        description:
          'Nuestro equipo de moderación lo revisará en las próximas 24 horas hábiles.',
      })
      router.push('/')
    } catch (err) {
      const e = err as Error
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <StaticPageShell
      title="Reportar infracción"
      breadcrumbs={[{ label: 'Reportar infracción' }]}
      maxWidth="max-w-3xl"
      pageHeader={
        <PageHeader
          title="Reportar infracción"
          subtitle="Programa Verifica de Vende Ya Perú. Reporta productos que infrinjan propiedad intelectual, marca o derechos de autor."
          icon={ShieldAlert}
          iconAccent="text-rose-400"
          glow="bg-rose-500"
        />
      }
    >
      {/* Before reporting — warning card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-rose-500/10 via-card to-amber-500/10 border border-rose-500/30 p-5 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <p className="font-black text-foreground text-sm mb-2 flex items-center gap-1.5">
              Antes de reportar
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                'Solo reporta si eres el titular de la marca o su representante legal autorizado.',
                'Incluye evidencia clara (URL del producto, capturas, registro de marca en INDECOPI).',
                'Falsos reportes pueden resultar en acciones legales contra el reportante.',
                'Vende Ya actuará en menos de 24 horas hábiles sobre tu reporte.',
              ].map((rule, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">●</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="font-black text-foreground text-base">Detalles del reporte</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Completa el formulario con la mayor cantidad de detalle posible. Los campos marcados con * son obligatorios.
            </p>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <div>
              <DarkLabel htmlFor="reporterEmail">Tu email *</DarkLabel>
              <DarkInput
                id="reporterEmail"
                type="email"
                required
                value={form.reporterEmail}
                onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                placeholder="abogado@marca.com.pe"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Te contactaremos por este correo para validar tu identidad y notificarte el resultado.
              </p>
            </div>

            <div>
              <DarkLabel htmlFor="targetOrderOrStreamId">URL del producto o stream infractor *</DarkLabel>
              <DarkInput
                id="targetOrderOrStreamId"
                required
                value={form.targetOrderOrStreamId}
                onChange={(e) => setForm({ ...form, targetOrderOrStreamId: e.target.value })}
                placeholder="https://vendeya.live/productos/xxx"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Copia la URL completa del producto, subasta o stream que contiene la infracción.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <DarkLabel htmlFor="targetSellerId">ID o usuario del vendedor *</DarkLabel>
                <DarkInput
                  id="targetSellerId"
                  required
                  value={form.targetSellerId}
                  onChange={(e) => setForm({ ...form, targetSellerId: e.target.value })}
                  placeholder="@username o usr_xxx"
                />
              </div>
              <div>
                <DarkLabel htmlFor="infringedBrand">Marca infringida *</DarkLabel>
                <DarkInput
                  id="infringedBrand"
                  required
                  value={form.infringedBrand}
                  onChange={(e) => setForm({ ...form, infringedBrand: e.target.value })}
                  placeholder="Nike, Adidas, Samsung..."
                />
              </div>
            </div>

            <div>
              <DarkLabel htmlFor="reason">Motivo del reporte *</DarkLabel>
              <DarkSelect
                id="reason"
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value as typeof form.reason })}
              >
                <option value="" className="bg-card">— Selecciona un motivo —</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-card">
                    {r.label}
                  </option>
                ))}
              </DarkSelect>
            </div>

            <div>
              <DarkLabel htmlFor="description">Descripción del reporte *</DarkLabel>
              <DarkTextarea
                id="description"
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe en detalle la infracción: por qué consideras que el producto infringe, qué derechos posees, número de registro INDECOPI si aplica, etc."
              />
            </div>

            {/* Evidence URL + upload */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <DarkLabel htmlFor="evidenceUrl">URL de evidencia</DarkLabel>
                <DarkInput
                  id="evidenceUrl"
                  type="url"
                  value={form.evidenceUrl}
                  onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Link a capturas, registro SUNAT, contrato de representación, etc.
                </p>
              </div>
              <div>
                <DarkLabel>Adjuntar evidencia</DarkLabel>
                <label
                  htmlFor="evidence-file"
                  className="flex items-center gap-3 cursor-pointer rounded-xl bg-muted border-2 border-dashed border-border hover:border-amber-400/50 hover:bg-amber-400/5 transition-all p-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Upload className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {fileName ?? 'Subir archivo'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {fileName ?? 'JPG, PNG, PDF. Máx 10MB.'}
                    </p>
                  </div>
                </label>
                <input
                  id="evidence-file"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setFileName(f.name)
                      toast({
                        title: 'Archivo cargado',
                        description: `${f.name} (${(f.size / 1024).toFixed(1)} KB)`,
                      })
                    }
                  }}
                />
              </div>
            </div>

            {/* Legal declaration */}
            <div className="rounded-xl bg-background/60 border border-border p-4">
              <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2">
                Declaración bajo juramento
              </p>
              <textarea
                readOnly
                value={`Al enviar este reporte, declaro bajo juramento que:

1. Soy el titular legítimo de la marca "${form.infringedBrand || '[marca]'}" o su representante legal autorizado.
2. La información proporcionada es veraz y tengo pruebas de la infracción.
3. Acepto que Vende Ya actúe de buena fe para retirar el contenido reportado.
4. Entiendo que falsos reportes pueden resultar en acciones legales contra mí.`}
                className="w-full bg-transparent text-xs text-muted-foreground leading-relaxed resize-none border-0 focus-visible:outline-none"
                rows={6}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border flex flex-col-reverse md:flex-row justify-between items-center gap-3">
            <GhostButton type="button" onClick={() => router.back()} className="w-full md:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </GhostButton>
            <GradientButton type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </GradientButton>
          </div>
        </motion.div>
      </form>

      {/* Footer note */}
      <div className="mt-6 rounded-2xl bg-muted border border-border p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vende Ya actúa como intermediario neutro bajo el principio Safe Harbor de la
          Ley N° 29571 (Código de Protección y Defensa del Consumidor). Para disputas
          complejas o requerimientos judiciales, contacta a{' '}
          <a
            href="mailto:legal@vendeya.live"
            className="text-amber-400 hover:text-amber-300 underline font-bold"
          >
            legal@vendeya.live
          </a>
          .
        </p>
        <div className="mt-3 flex items-center gap-2">
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
          <Link href="/terminos" className="text-xs text-muted-foreground hover:text-amber-400">
            Ver términos y condiciones completos
          </Link>
        </div>
      </div>
    </StaticPageShell>
  )
}
