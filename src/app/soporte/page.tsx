'use client'

import * as React from 'react'
import Link from 'next/link'
import { MessageCircle, Mail, Phone, Clock, Send, ChevronRight } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ROUTES } from '@/lib/vendeda/routes'

const breadcrumbs: Breadcrumb[] = [{ label: 'Soporte' }]

const FAQ_LINKS = [
  { q: '¿Cómo pujar en una subasta?', a: 'Ve a la subasta en vivo, escribe tu monto y presiona "Pujar ahora". El sistema valida automáticamente.' },
  { q: '¿Qué hago si gané y no me llega el producto?', a: 'Espera 48h. Si no llega, abre una disputa desde "Mis pedidos" y nuestro equipo media en 48h.' },
  { q: '¿Cómo cobro si vendí?', a: 'El pago se acredita en tu método preferido (Yape/Plin/banco) en 24-48h tras la entrega confirmada.' },
  { q: '¿Puedo cancelar una puja?', a: 'No. Las pujas son compromisos legales. Solo se cancelan si el vendedor no envía o hay fraude.' },
  { q: '¿Qué comisión cobra Vende Ya?', a: '5% del precio final (3% para vendedores Pro). Sin cargo por publicar.' },
]

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
    toast({ title: '✅ Mensaje enviado', description: 'Te responderemos en menos de 24h.' })
    setName(''); setEmail(''); setSubject(''); setMessage('')
  }

  return (
    <AppShell title="Soporte" breadcrumbs={breadcrumbs} maxWidth="max-w-4xl">
      {/* Contact channels */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <Card className="p-5 text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-lima-500" />
          <h3 className="font-semibold text-sm">WhatsApp</h3>
          <p className="text-xs text-muted-foreground mt-1">Lun-Sáb 9am-9pm</p>
          <Button
            variant="outline" size="sm" className="mt-3 w-full"
            onClick={() => toast({ title: 'Abriendo WhatsApp', description: '+51 987 654 321' })}
          >
            Chatear ahora
          </Button>
        </Card>
        <Card className="p-5 text-center">
          <Mail className="h-8 w-8 mx-auto mb-2 text-salsa-500" />
          <h3 className="font-semibold text-sm">Email</h3>
          <p className="text-xs text-muted-foreground mt-1">Respuesta en 24h</p>
          <Button
            variant="outline" size="sm" className="mt-3 w-full"
            onClick={() => toast({ title: 'Abriendo email', description: 'soporte@vendeya.pe' })}
          >
            Enviar correo
          </Button>
        </Card>
        <Card className="p-5 text-center">
          <Phone className="h-8 w-8 mx-auto mb-2 text-plin-500" />
          <h3 className="font-semibold text-sm">Teléfono</h3>
          <p className="text-xs text-muted-foreground mt-1">Lun-Vie 9am-6pm</p>
          <Button
            variant="outline" size="sm" className="mt-3 w-full"
            onClick={() => toast({ title: 'Llamando', description: '(01) 640-2025' })}
          >
            +51 1 640-2025
          </Button>
        </Card>
      </div>

      {/* FAQ preview */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Preguntas frecuentes</h3>
          <Link href={ROUTES.faq} className="text-xs text-salsa-600 hover:underline flex items-center">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {FAQ_LINKS.slice(0, 3).map((item, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-sm font-medium p-2 rounded hover:bg-muted/50 flex items-center justify-between">
                {item.q}
                <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-xs text-muted-foreground px-2 pb-2">{item.a}</p>
            </details>
          ))}
        </div>
      </Card>

      {/* Contact form */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Envíanos un mensaje</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea id="message" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button
            type="submit" disabled={sending}
            className="w-full bg-salsa-500 hover:bg-salsa-600 text-white h-12"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar mensaje'}
          </Button>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Tiempo de respuesta promedio: 4 horas
          </p>
        </form>
      </Card>
    </AppShell>
  )
}
