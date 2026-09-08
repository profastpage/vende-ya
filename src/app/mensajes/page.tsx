'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Phone, Video, MoreVertical, Search, ArrowLeft,
  MessageSquare, BadgeCheck, Image as ImageIcon, Loader2, Sparkles, Radio,
} from 'lucide-react'
import { StaticPageShell } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { useToast } from '@/hooks/use-toast'
import { initials, timeAgoEs } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import type { Breadcrumb } from '@/components/vendeda/AppShell'
import {
  getConversations,
  getMessages,
  sendMessage,
  getUserByUsername,
  type ConversationSummary,
  type ChatMessage,
} from './actions'

const breadcrumbs: Breadcrumb[] = [{ label: 'Mensajes' }]

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
            <div className="rounded-2xl bg-card/80 border border-border p-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const uParam = searchParams.get('u')
  const { toast } = useToast()

  const [conversations, setConversations] = React.useState<ConversationSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeUser, setActiveUser] = React.useState<ConversationSummary | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = React.useState(false)
  const [input, setInput] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [chatOpenMobile, setChatOpenMobile] = React.useState(false)

  const endRef = React.useRef<HTMLDivElement>(null)

  // 1. Load initial real conversations from PostgreSQL
  const loadConversations = React.useCallback(async () => {
    const res = await getConversations()
    if (res.success) {
      setConversations(res.conversations)
      return res.conversations
    }
    return []
  }, [])

  React.useEffect(() => {
    let isMounted = true
    loadConversations().then(async (convs) => {
      if (!isMounted) return

      if (uParam) {
        // Find existing conversation with this user
        const existing = convs.find(
          (c) => c.username.toLowerCase() === uParam.toLowerCase() || c.userId === uParam
        )
        if (existing) {
          setActiveUser(existing)
          setChatOpenMobile(true)
        } else {
          // Look up user profile to start new thread
          const profileRes = await getUserByUsername(uParam)
          if (profileRes.success && profileRes.profile && isMounted) {
            const p = profileRes.profile
            const newConv: ConversationSummary = {
              userId: p.id,
              username: p.username,
              displayName: p.displayName || p.username,
              avatarUrl: p.avatarUrl,
              isVerified: p.isVerified,
              lastMsg: 'Inicia la conversación',
              lastTime: Date.now(),
              unread: false,
              unreadCount: 0,
            }
            setActiveUser(newConv)
            setChatOpenMobile(true)
          }
        }
      } else if (convs.length > 0) {
        setActiveUser(convs[0])
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [loadConversations, uParam])

  // 2. Load messages whenever activeUser changes
  React.useEffect(() => {
    if (!activeUser?.userId) {
      setMessages([])
      return
    }

    let isMounted = true
    setLoadingMessages(true)

    getMessages(activeUser.userId).then((res) => {
      if (isMounted) {
        if (res.success) {
          setMessages(res.messages)
        }
        setLoadingMessages(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [activeUser?.userId])

  // Scroll to bottom on new messages
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message to PostgreSQL
  const handleSend = async () => {
    if (!input.trim() || !activeUser?.userId || sending) return

    const textToSend = input.trim()
    setInput('')
    setSending(true)

    const res = await sendMessage(activeUser.userId, textToSend)
    setSending(false)

    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!])

      // Refresh conversations list to update lastMsg
      loadConversations()
    } else {
      toast({
        title: 'Error al enviar',
        description: res.error || 'No se pudo enviar el mensaje. Intenta de nuevo.',
        variant: 'destructive',
      })
      setInput(textToSend)
    }
  }

  const openConversation = (c: ConversationSummary) => {
    setActiveUser(c)
    setChatOpenMobile(true)
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="rounded-2xl bg-card/80 border border-border p-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
        <p className="text-sm text-muted-foreground">Cargando tus mensajes...</p>
      </div>
    )
  }

  // Pure 0 conversations state with NO fake mock contacts
  if (conversations.length === 0 && !activeUser) {
    return (
      <div className="rounded-2xl bg-card/80 border border-border p-8 md:p-16 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold font-display text-foreground">
          0 conversaciones activas
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Tu bandeja de mensajes está vacía. Cuando contactes a un vendedor desde un producto, una subasta en vivo o un perfil para coordinar envíos y pagos, aparecerán aquí tus chats en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link
            href={ROUTES.marketplace}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-zinc-950 font-bold text-sm hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Explorar Marketplace
          </Link>
          <Link
            href={ROUTES.live}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-muted border border-border hover:bg-muted/80 text-foreground font-semibold text-sm transition-colors"
          >
            <Radio className="w-4 h-4 text-rose-400" />
            Ver En Vivo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl bg-card/80 border border-border backdrop-blur-sm overflow-hidden">
      <div className="grid md:grid-cols-3 h-[calc(100vh-14rem)] min-h-[540px]">
        {/* Conversation list */}
        <div
          className={`md:col-span-1 flex flex-col border-r border-border ${
            chatOpenMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header count + search */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Bandeja de entrada
              </span>
              <span className="text-xs font-bold text-amber-400">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Buscar conversación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {search ? `Sin resultados para "${search}"` : '0 conversaciones'}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeUser?.userId === c.userId
                return (
                  <button
                    key={c.userId}
                    onClick={() => openConversation(c)}
                    className={`w-full flex items-center gap-3 p-3 transition-colors text-left border-l-2 ${
                      isActive
                        ? 'bg-muted border-l-amber-400'
                        : 'border-l-transparent hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-zinc-950 font-black text-sm overflow-hidden">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials(c.displayName)
                        )}
                      </div>
                      {c.unread && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-foreground truncate flex items-center gap-1">
                          {c.displayName}
                          {c.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgoEs(new Date(c.lastTime))}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          c.unread ? 'font-bold text-foreground' : 'text-muted-foreground'
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

        {/* Active conversation chat panel */}
        <div
          className={`md:col-span-2 flex flex-col bg-background/30 ${
            chatOpenMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeUser ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setChatOpenMobile(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-muted"
                    aria-label="Volver a la lista"
                  >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                  </button>
                  <Link
                    href={`/vendedores/${activeUser.username}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-zinc-950 font-black text-xs shrink-0 overflow-hidden">
                      {activeUser.avatarUrl ? (
                        <img
                          src={activeUser.avatarUrl}
                          alt={activeUser.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials(activeUser.displayName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                        {activeUser.displayName}
                        {activeUser.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{activeUser.username}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/vendedores/${activeUser.username}`}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-2.5">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-400" />
                    Cargando conversación...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30 text-amber-400" />
                    <p className="text-sm font-semibold text-foreground">
                      Inicia tu conversación con {activeUser.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Escribe un mensaje para consultar detalles, disponibilidad del producto o coordinar la entrega.
                    </p>
                  </div>
                ) : (
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
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            m.fromMe
                              ? 'bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-semibold rounded-br-sm shadow-md'
                              : 'bg-muted border border-border text-foreground rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          <div
                            className={`text-[10px] mt-1 text-right ${
                              m.fromMe ? 'text-zinc-950/60 font-mono' : 'text-muted-foreground'
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
                )}
                <div ref={endRef} />
              </div>

              {/* Message Input bar */}
              <div className="p-3 border-t border-border flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={`Escribe un mensaje a ${activeUser.displayName}...`}
                  className="flex-1 h-10 px-4 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-600 text-zinc-950 font-black flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-500/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Enviar"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline text-xs">Enviar</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-amber-400" />
              <p className="font-semibold text-foreground">Selecciona una conversación</p>
              <p className="text-xs text-muted-foreground mt-1">
                Elige un contacto de la izquierda para ver el historial de mensajes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
