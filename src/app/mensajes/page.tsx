'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Phone, Video, MoreVertical, Search, ArrowLeft,
  MessageSquare, BadgeCheck, Image as ImageIcon,
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { initials, timeAgoEs } from '@/lib/vendeda/format'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

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
    <AuthGuard>
      <StaticPageShell
        title="Mensajes"
        breadcrumbs={breadcrumbs}
        maxWidth="max-w-5xl"
      >
        <React.Suspense
          fallback={
            <div className="rounded-2xl bg-zinc-900/80 border border-white/5 p-12 text-center text-zinc-500">
              Cargando mensajes...
            </div>
          }
        >
          <MessagesInner />
        </React.Suspense>
      </StaticPageShell>
    </AuthGuard>
  )
}

function MessagesInner() {
  const params = useSearchParams()
  const activeUsername = params.get('u') ?? CONVERSATIONS[0].username
  const { toast } = useToast()
  const [active, setActive] = React.useState(activeUsername)
  // Mobile: tracks whether the chat panel is open (replaces the list)
  const [chatOpenMobile, setChatOpenMobile] = React.useState(false)
  const [search, setSearch] = React.useState('')
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

  const filteredConversations = CONVERSATIONS.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  )

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = (username: string) => {
    setActive(username)
    setChatOpenMobile(true)
  }

  const send = () => {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        fromMe: true,
        text: input,
        time: Date.now(),
      },
    ])
    setInput('')
    toast({ title: 'Enviado', description: 'Mensaje entregado' })
  }

  return (
    <div className="relative rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm overflow-hidden">
      <div className="grid md:grid-cols-3 h-[calc(100vh-12rem)] min-h-[520px]">
        {/* Conversation list */}
        <div
          className={`md:col-span-1 flex flex-col border-r border-white/5 ${
            chatOpenMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                placeholder="Buscar conversación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Sin conversaciones para "{search}"
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = active === c.username
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.username)}
                    className={`w-full flex items-center gap-3 p-3 transition-colors text-left border-l-2 ${
                      isActive
                        ? 'bg-white/5 border-l-amber-400'
                        : 'border-l-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-white font-black text-sm">
                        {initials(c.displayName)}
                      </div>
                      {c.unread && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white truncate flex items-center gap-1">
                          {c.displayName}
                          {c.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />}
                        </span>
                        <span className="text-[10px] text-zinc-500 shrink-0">
                          {timeAgoEs(new Date(c.lastTime))}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          c.unread ? 'font-semibold text-zinc-200' : 'text-zinc-500'
                        }`}
                      >
                        {c.lastMsg}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Active conversation */}
        <div
          className={`md:col-span-2 flex flex-col bg-zinc-950/30 ${
            chatOpenMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setChatOpenMobile(false)}
                className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/5"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                {initials(activeUser.displayName)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate flex items-center gap-1">
                  {activeUser.displayName}
                  {activeUser.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                </div>
                <div className="text-[10px] text-lime-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
                  En línea
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center" aria-label="Llamar">
                <Phone className="h-4 w-4 text-zinc-400" />
              </button>
              <button className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center" aria-label="Videollamar">
                <Video className="h-4 w-4 text-zinc-400" />
              </button>
              <button className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center" aria-label="Más">
                <MoreVertical className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                      m.fromMe
                        ? 'bg-gradient-to-r from-amber-400 to-fuchsia-500 text-zinc-950 font-semibold rounded-br-md'
                        : 'bg-white/5 border border-white/10 text-white rounded-bl-md'
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[10px] mt-1 ${
                        m.fromMe ? 'text-zinc-950/60' : 'text-zinc-500'
                      }`}
                    >
                      {new Date(m.time).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 flex items-center gap-2">
            <button
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center shrink-0"
              aria-label="Adjuntar imagen"
              onClick={() => toast({ title: 'Adjuntar imagen', description: 'Próximamente' })}
            >
              <ImageIcon className="h-4 w-4 text-zinc-400" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Escribe un mensaje..."
              className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-500/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state — only shown when no conversations (placeholder for future) */}
      {CONVERSATIONS.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <div className="text-center p-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-300 font-semibold">No hay conversaciones aún</p>
            <p className="text-zinc-500 text-xs mt-1">
              Cuando inicies una conversación con un vendedor o comprador, aparecerá aquí.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex mt-4 items-center gap-2 px-4 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold"
            >
              Explorar marketplace
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
