'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { initials, timeAgoEs } from '@/lib/vendeda/format'

const breadcrumbs: Breadcrumb[] = [{ label: 'Mensajes' }]

interface Msg {
  id: string
  fromMe: boolean
  text: string
  time: number
}

const CONVERSATIONS = MOCK_PROFILES.slice(0, 5).map((p, i) => ({
  ...p,
  lastMsg: ['Hola, ¿aún tienes el polo?', 'Te transfiero el Yape ahora 🙌', '¿Envías a Arequipa?', '¿Aceptas Plin?', 'Gracias, llegó hoy'][i],
  lastTime: Date.now() - (i + 1) * 3600_000,
  unread: i < 2,
}))

export default function MessagesPage() {
  return (
    <AppShell title="Mensajes" breadcrumbs={breadcrumbs} maxWidth="max-w-5xl">
      <React.Suspense fallback={<Card className="p-8 text-center text-muted-foreground">Cargando mensajes...</Card>}>
        <MessagesInner />
      </React.Suspense>
    </AppShell>
  )
}

function MessagesInner() {
  const params = useSearchParams()
  const activeUsername = params.get('u') ?? CONVERSATIONS[0].username
  const { toast } = useToast()
  const [active, setActive] = React.useState(activeUsername)
  const [messages, setMessages] = React.useState<Msg[]>([
    { id: '1', fromMe: false, text: '¡Hola! Vi tu subasta 🙌', time: Date.now() - 3600_000 },
    { id: '2', fromMe: true,  text: '¡Hola! Sí, aún está disponible', time: Date.now() - 3500_000 },
    { id: '3', fromMe: false, text: '¿Aceptas Yape?', time: Date.now() - 3400_000 },
    { id: '4', fromMe: true,  text: 'Sí, Yape o Plin. Ambos ✅', time: Date.now() - 3300_000 },
    { id: '5', fromMe: false, text: 'Genial, te mando el Yape ahora', time: Date.now() - 3200_000 },
  ])
  const [input, setInput] = React.useState('')
  const endRef = React.useRef<HTMLDivElement>(null)

  const activeUser = CONVERSATIONS.find((c) => c.username === active) ?? CONVERSATIONS[0]

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    setMessages((prev) => [...prev, {
      id: Math.random().toString(36).slice(2),
      fromMe: true,
      text: input,
      time: Date.now(),
    }])
    setInput('')
    toast({ title: '✓ Enviado', description: 'Mensaje entregrado' })
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-3 h-[70vh]">
        {/* Conversation list */}
        <div className="border-r md:col-span-1 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-10 h-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto chat-scroll">
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.username)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${
                  active === c.username ? 'bg-salsa-50' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={c.avatarUrl ?? undefined} alt={c.displayName} />
                    <AvatarFallback>{initials(c.displayName)}</AvatarFallback>
                  </Avatar>
                  {c.unread && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-salsa-500 border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{c.displayName}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgoEs(new Date(c.lastTime))}</span>
                  </div>
                  <p className={`text-xs truncate ${c.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {c.lastMsg}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active conversation */}
        <div className="md:col-span-2 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activeUser.avatarUrl ?? undefined} alt={activeUser.displayName} />
                <AvatarFallback>{initials(activeUser.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">{activeUser.displayName}</div>
                <div className="text-[10px] text-lima-600">● En línea</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Llamar">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Videollamar">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Más">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-2 bg-muted/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    m.fromMe
                      ? 'bg-salsa-500 text-white rounded-br-sm'
                      : 'bg-card border rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  <div className={`text-[10px] mt-0.5 ${m.fromMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {new Date(m.time).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Escribe un mensaje..."
              className="flex-1 h-10"
            />
            <Button
              onClick={send}
              disabled={!input.trim()}
              className="bg-salsa-500 hover:bg-salsa-600 text-white h-10 w-10 p-0"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
