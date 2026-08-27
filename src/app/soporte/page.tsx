'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MessageCircle, Mail, Phone, Clock, Send, ChevronRight, LifeBuoy,
} from 'lucide-react'
import {
  StaticPageShell,
  PageHeader,
  DarkInput,
  DarkTextarea,
  DarkLabel,
  GradientButton,
  GhostButton,
  staggerContainer,
  staggerItem,
} from '@/components/vendeda/StaticPageShell'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/vendeda/routes'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Soporte' }]

const FAQ_LINKS = [
  { q: '¿Cómo pujar en una subasta?', a: 'Ve a la subasta en vivo, escribe tu monto y presiona "Pujar ahora". El sistema valida automáticamente.' },
  { q: '¿Qué hago si gané y no me llega el producto?', a: 'Espera 48h. Si no llega, abre una disputa desde "Mis pedidos" y nuestro equipo media en 48h.' },
  { q: '¿Cómo cobro si vendí?', a: 'El pago se acredita en tu método preferido (Yape/Plin/banco) en 24-48h tras la entrega confirmada.' },
  { q: '¿Puedo cancelar una puja?', a: 'No. Las pujas son compromisos legales. Solo se cancelan si el vendedor no envía o hay fraude.' },
  { q: '¿Qué comisión cobra Vende Ya?', a: '5% del precio final (3% para vendedores Pro). Sin cargo por publicar.' },
]

const CHANNELS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    desc: 'Lun-Sáb 9am-9pm',
    detail: '+51 987 654 321',
    cta: 'Chatear ahora',
    accent: 'text-lime-400',
    gradient: 'from-lime-400/20 via-transparent to-emerald-500/10',
    glow: 'bg-lime-500/20',
  },
  {
    icon: Mail,
    title: 'Email',
    desc: 'Respuesta en 24h',
    detail: 'soporte@vendeya.live',
    cta: 'Enviar correo',
    accent: 'text-amber-400',
    gradient: 'from-amber-400/20 via-transparent to-orange-500/10',
    glow: 'bg-amber-500/20',
  },
  {
    icon: Phone,
    title: 'Teléfono',
    desc: 'Lun-Vie 9am-6pm',
    detail: '(01) 640-2025',
    cta: 'Llamar ahora',
    accent: 'text-fuchsia-400',
    gradient: 'from-fuchsia-400/20 via-transparent to-purple-500/10',
    glow: 'bg-fuchsia-500/20',
  },
] as const

export default function SupportPage() {
  const { toast } = useToast()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [sending, setSending] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSending(false)
    toast({
      title: 'Mensaje enviado',
      description: 'Te responderemos en menos de 24h.',
    })
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
  }

  return (
    <StaticPageShell
      title="Soporte"
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-4xl"
      pageHeader={
        <PageHeader
          title="Centro de soporte"
          subtitle="¿Necesitas ayuda con una compra, venta, pago o envío? Estamos aquí para ti, todos los días."
          icon={LifeBuoy}
          glow="bg-amber-500"
        />
      }
    >
      {/* CTA cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        {CHANNELS.map((ch) => {
          const Icon = ch.icon
          return (
            <motion.div
              key={ch.title}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${ch.gradient} bg-card/80 border border-border backdrop-blur-sm p-6 text-center`}
            >
              <div
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${ch.glow} blur-3xl`}
                aria-hidden
              />
              <div className="relative">
                <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-muted backdrop-blur-xl border border-border flex items-center justify-center">
                  <Icon className={`h-7 w-7 ${ch.accent}`} />
                </div>
                <h3 className="font-black text-foreground text-base">{ch.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{ch.desc}</p>
                <p className={`text-sm font-bold mt-2 ${ch.accent}`}>{ch.detail}</p>
                <GhostButton
                  className="mt-4 w-full h-10 text-xs"
                  onClick={() =>
                    toast({
                      title: ch.title === 'WhatsApp' ? 'Abriendo WhatsApp' : ch.title === 'Email' ? 'Abriendo email' : 'Llamando',
                      description: ch.detail,
                    })
                  }
                >
                  {ch.cta}
                </GhostButton>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* FAQ teaser + Contact form (2 columns on desktop) */}
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
        {/* FAQ teaser */}
        <div className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-foreground text-base">Preguntas frecuentes</h3>
            <Link
              href={ROUTES.faq}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-0.5"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {FAQ_LINKS.map((item, i) => (
              <details key={i} className="group rounded-lg bg-muted border border-border hover:border-amber-400/40 transition-colors">
                <summary className="cursor-pointer list-none p-3 text-sm font-semibold text-foreground flex items-center justify-between gap-2">
                  {item.q}
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amber-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-6">
          <h3 className="font-black text-foreground text-base mb-1">Envíanos un mensaje</h3>
          <p className="text-xs text-muted-foreground mb-5">
            Completa el formulario y te responderemos por correo en menos de 24 horas hábiles.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <DarkLabel htmlFor="name">Nombre</DarkLabel>
                <DarkInput
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <DarkLabel htmlFor="email">Email</DarkLabel>
                <DarkInput
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <DarkLabel htmlFor="subject">Asunto</DarkLabel>
              <DarkInput
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="¿Sobre qué necesitas ayuda?"
              />
            </div>
            <div>
              <DarkLabel htmlFor="message">Mensaje</DarkLabel>
              <DarkTextarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu consulta con el mayor detalle posible. Incluye IDs de pedido o subasta si tienes."
              />
            </div>
            <GradientButton type="submit" disabled={sending} className="w-full">
              <Send className="h-4 w-4" />
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </GradientButton>
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3" /> Tiempo de respuesta promedio: 4 horas hábiles
            </p>
          </form>
        </div>
      </div>
    </StaticPageShell>
  )
}
