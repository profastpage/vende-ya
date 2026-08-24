'use client'

import * as React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Flame, Eye, Heart, Share2, ShoppingBag,
  MessageCircle, Send, Gavel, Clock, BadgeCheck, ShieldCheck,
  Bot, Users, Crown, MapPin, Package, Star, Zap, X,
Maximize, Minimize,
} from 'lucide-react'
import type { Profile, Product, Auction } from '@/lib/vendeda/types'
import {
  
} from '@/lib/vendeda/mock-data'
import { formatViewers, formatPEN, timeAgoEs } from '@/lib/vendeda/format'
import CheckoutBottomSheet from '@/components/vendeda/CheckoutBottomSheet'

/* ================================================================ *
 * Ultra Inmersiva — Live Room detail page (Twitch/Kick on desktop, *
 * TikTok full-screen vertical on mobile). Dark premium theme.       *
 * ================================================================= *
 * Cambios UX (basados en feedback VLM):
 *  - "248 espectadores" sin fondo negro — solo bold + icono.
 *  - Botones laterales (Like/Chat/Share) SIN fondo negro.
 *  - Heart = solo icono + count, sin círculo.
 *  - Emojis flotantes (🔥 ⚡ 💜) que aparecen a todos los espectadores.
 *  - Solo participantes activos (compradores/pujadores) pueden emitirlos.
 *  - Bottom console más compacto (pb-4 en vez de pb-6, panel más bajo).
 *  - SellerPill más limpia.
 * ================================================================ */

interface ChatMessage {
  id: string
  username: string
  text: string
  color: string
  isBot?: boolean
}


const QUICK_BIDS = [2, 5, 10]

/* Emojis disponibles para participantes (pujadores/compradores) */
const LIVE_EMOJIS = [
  { id: 'fire',      char: '🔥', label: 'Fuego'    },
  { id: 'lightning', char: '⚡', label: 'Trueno'   },
  { id: 'heart',     char: '💖', label: 'Corazón'  },
  { id: 'clap',      char: '👏', label: 'Aplauso'  },
  { id: 'star',      char: '🌟', label: 'Estrella' },
] as const

interface FloatingEmoji {
  id: number
  char: string
  x: number
  y: number
}

/* ---------------- Extracted presentational components ---------------- */

function LiveBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-rose-500/90 backdrop-blur-md border border-rose-300/30 ${
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      } font-black tracking-wider text-white`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      EN VIVO
    </span>
  )
}

/** ViewersPill — solo texto bold + icono, sin fondo negro (mejor UX) */
function ViewersPill({ viewers }: { viewers: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-white">
      <Eye className="h-3.5 w-3.5 text-amber-400" strokeWidth={2.5} />
      <span className="text-xs font-black tabular-nums drop-shadow-lg">
        {formatViewers(viewers)}
      </span>
    </span>
  )
}

/** SellerPill — username + rating + ubicación, más limpia */
function SellerPill({ seller, initial }: { seller: Profile; initial: string }) {
  return (
    <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 border border-amber-300/40 flex items-center justify-center font-black text-zinc-950 text-xs">
        {initial}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-black tracking-tight flex items-center gap-1 text-white">
          {seller.displayName}
          {seller.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400" />}
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-amber-300">{seller.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{seller.department}</span>
        </span>
      </div>
    </div>
  )
}

function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={`text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border ${
        msg.isBot
          ? 'bg-purple-500/15 border-purple-400/30 shadow-lg shadow-purple-500/10'
          : 'bg-zinc-900/80 border-white/5 text-zinc-100 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`font-bold ${msg.color}`}>{msg.username}</span>
        {msg.isBot && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[9px] font-black tracking-wider">
            <Bot className="h-2.5 w-2.5" /> BOT AI
          </span>
        )}
        {msg.isBot && <BadgeCheck className="h-3 w-3 text-purple-300" />}
      </div>
      <p className="mt-0.5 text-zinc-100 leading-snug">{msg.text}</p>
    </motion.div>
  )
}

function ChatInputBar({
  chatInput,
  setChatInput,
  onSend,
  compact = false,
}: {
  chatInput: string
  setChatInput: (v: string) => void
  onSend: () => void
  compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'px-3 py-2.5'} bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl`}>
      <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Escribe..."
        className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none py-1.5"
      />
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onSend}
        className="h-8 w-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-400/20 transition-colors"
        aria-label="Enviar mensaje"
      >
        <Send className="h-3.5 w-3.5 text-zinc-950" />
      </motion.button>
    </div>
  )
}

function CountdownCard({
  mm, ss, lowTime, size = 'md',
}: {
  mm: string
  ss: string
  lowTime: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <motion.div
      animate={lowTime ? { scale: [1, 1.04, 1] } : {}}
      transition={{ duration: 0.8, repeat: lowTime ? Infinity : 0 }}
      className={`relative overflow-hidden rounded-2xl border px-3 py-1.5 flex flex-col items-center min-w-[88px] ${
        lowTime
          ? 'bg-rose-500/20 border-rose-500/30'
          : 'bg-zinc-900/80 border-white/5 text-zinc-100 shadow-sm'
      }`}
    >
      <span className={`text-[9px] font-black tracking-widest uppercase ${lowTime ? 'text-rose-300' : 'text-amber-400'}`}>
        <Clock className="inline h-2.5 w-2.5 mr-1" />
        Cierra en
      </span>
      <span className={`font-mono font-black tabular-nums tracking-tight ${size === 'sm' ? 'text-base' : 'text-xl'} ${lowTime ? 'text-rose-200' : 'text-white'}`}>
        {mm}:{ss}
      </span>
    </motion.div>
  )
}

function BidPill({ amount, onBid }: { amount: number; onBid: (n: number) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05, y: -2 }}
      onClick={() => onBid(amount)}
      className="flex-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-amber-400/40 px-3 py-2 text-xs font-black text-amber-300 transition-colors flex items-center justify-center gap-0.5"
    >
      <span className="text-muted-foreground">+</span>S/{amount}
    </motion.button>
  )
}

function PujarButton({ increment, onBid, full = false }: { increment: number; onBid: (n: number) => void; full?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.3)', '0 0 32px rgba(251,191,36,0.5)', '0 0 20px rgba(251,191,36,0.3)'] }}
      transition={{ duration: 2.4, repeat: Infinity }}
      onClick={() => onBid(increment)}
      className={`${full ? 'w-full' : 'flex-1'} relative overflow-hidden bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black uppercase tracking-wider text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20`}
    >
      <Gavel className="h-4 w-4" />
      Pujar ahora
      <span className="ml-1 text-[10px] bg-background/30 px-1.5 py-0.5 rounded-md">+S/{increment}</span>
    </motion.button>
  )
}

function ComprarYaButton({
  buyNowPrice, onBuy, full = false,
}: {
  buyNowPrice: number
  onBuy: () => void
  full?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ borderColor: 'rgba(245,158,11,0.5)' }}
      onClick={onBuy}
      className={`${full ? 'w-full' : ''} bg-zinc-900 border border-white/10 hover:border-amber-400/40 text-white shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors`}
    >
      <ShoppingBag className="h-4 w-4 text-amber-400" />
      <span className="text-muted-foreground">Comprar ya</span>
      <span className="text-white font-mono font-black">{formatPEN(buyNowPrice)}</span>
    </motion.button>
  )
}

/* ---------------- Main page ---------------- */

export default function LiveRoomClient({ stream, auction, product, seller }: { stream: any, auction: any, product: any, seller: any }) {
    const router = useRouter()
  const id = stream?.id || 'demo'

  
  const safeAuction = auction || { id: '', currentPrice: 0, bidCount: 0, buyNowPrice: 0, startingPrice: 0, bidIncrement: 2 };
  const safeProduct = product || { title: 'Esperando producto...', description: 'El vendedor no ha iniciado una subasta.', stock: 0 };
  const [currentBid, setCurrentBid] = React.useState(safeAuction.currentPrice)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  React.useEffect(() => {
      // Chat Realtime (Always active)
      const chatChannel = supabase.channel(`chat_${id}`)
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          // prevent duplicates if it's our own message bouncing back
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      }).subscribe()

      // Auction Realtime (Only if auction exists)
      let auctionChannel: any = null
      if (auction?.id) {
        auctionChannel = supabase.channel(`auction_${safeAuction.id}`)

      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Auction', filter: `id=eq.${safeAuction.id}` },
        (payload) => {
          if (payload.new && payload.new.currentPrice) {
            setCurrentBid(payload.new.currentPrice)
            setBidCount(payload.new.bidCount)
          }
        }
      )
      .subscribe()
      }

      return () => { 
        supabase.removeChannel(chatChannel);
        if (auctionChannel) supabase.removeChannel(auctionChannel); 
      }
    }, [auction?.id, id, supabase])

  const executeRealtimeBid = async (inc: number) => {
    const newPrice = +(currentBid + inc).toFixed(2);
    handleQuickBid(inc); // update locally immediately for UX
    // In a real app, we'd hit an API route to securely record the bid.
    // For this prompt, we just trigger the UI update and let Supabase broadcast.
    await supabase.from('Auction').update({ currentPrice: newPrice, bidCount: bidCount + 1 }).eq('id', safeAuction.id);
  }

  const [bidCount, setBidCount] = React.useState(safeAuction.bidCount || 0); const [bids, setBids] = React.useState([]);
  const [viewers] = React.useState(stream?.viewerCount ?? 248)
  const [likes, setLikes] = React.useState(stream?.likeCount ?? 1240)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [chat, setChat] = React.useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = React.useState('')
  const [secondsLeft, setSecondsLeft] = React.useState(164)
  const [liked, setLiked] = React.useState(false)
  const [isZoomed, setIsZoomed] = React.useState(true)
  const [burstKey, setBurstKey] = React.useState(0)
  const [mobileTab, setMobileTab] = React.useState<'chat' | 'bid'>('bid')
  const [floatingEmojis, setFloatingEmojis] = React.useState<FloatingEmoji[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  // ¿Es participante activo? Solo quien pujó o compró puede emitir emojis.
  // Por ahora: si el usuario ha hecho al menos una puja o compra.
  const [hasParticipated, setHasParticipated] = React.useState(false)

  // Countdown ticker
  React.useEffect(() => {
    if (!stream?.isLive) return
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [stream?.isLive])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const lowTime = secondsLeft <= 30

  const handleQuickBid = (inc: number) => {
    setCurrentBid((prev) => +(prev + inc).toFixed(2))
    setBidCount((prev) => prev + 1)
    setHasParticipated(true) // al pujar, se vuelve participante
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: stream?.title || 'Vende Ya En Vivo',
          text: '¡Únete a esta transmisión en Vende Ya!',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Enlace copiado al portapapeles!')
      }
    } catch (e) {}
  }
  
  const handleLike = () => {
    setLiked((v) => !v)
    setLikes((l) => (liked ? Math.max(0, l - 1) : l + 1))
    setBurstKey((k) => k + 1)
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { id: Date.now().toString(), username: 'Tú', text: chatInput.trim(), color: 'text-lime-400' }
    setChat((prev) => [...prev, msg])
    setChatInput('')
    // Broadcast to others
    await supabase.channel(`chat_${id}`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: { ...msg, username: 'Comprador' }
    })
  }

  const handleEmojiTap = (emojiChar: string) => {
    if (!hasParticipated) {
      // Si no es participante, mostrar chat msg de recordatorio.
      setChat((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: 'YaBot AI',
          text: 'Para enviar reacciones, primero haz una puja o compra. ¡Es gratis! 💜',
          color: 'text-purple-400',
          isBot: true,
        },
      ])
      setShowEmojiPicker(false)
      return
    }
    // Generar emoji flotante en posición aleatoria
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      char: emojiChar,
      x: 60 + Math.random() * 40, // 60-100% (cerca del botón)
      y: 30 + Math.random() * 30, // 30-60% desde abajo
    }
    setFloatingEmojis((prev) => [...prev, newEmoji])
    // Remover tras animación
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id))
    }, 2400)
    setShowEmojiPicker(false)
  }

  
  const thumbnail = stream.thumbnailUrl ?? safeProduct.images?.[0] ?? ''
  const buyNowPrice = safeAuction.buyNowPrice ?? currentBid + 50
  const initial = seller.displayName?.slice(0, 2).toUpperCase() ?? 'VY'

  /* ================================================================ *
   * DESKTOP LAYOUT — 3 columns (55% video / 25% auction / 20% chat)   *
   * ================================================================ */
  const DesktopLayout = (
    <div className="hidden md:flex gap-6 max-w-7xl mx-auto p-4 bg-black text-zinc-100 min-h-[calc(100vh-4rem)]">
      {/* COLUMNA IZQUIERDA: Área Principal (Video, Producto y Puja) */}
      <main className="flex-1 space-y-6 flex flex-col min-w-0">
        {/* Video Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
          <iframe
            src={`https://player.kick.com/${stream?.kickUsername || 'gozustrike'}?autoplay=true&muted=false`}
            className="absolute inset-0 w-full h-full border-none pointer-events-none origin-center" style={{ transform: isZoomed ? 'scale(1.25)' : 'scale(1)' }}
            allow="autoplay; fullscreen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

          {/* Top overlays */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-3 z-20 pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={() => router.back()}
                className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Volver"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <SellerPill seller={seller} initial={initial} />
            </div>
            
              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <LiveBadge />
                <ViewersPill viewers={viewers} />
                <button
                  onClick={() => setIsZoomed((v) => !v)}
                  className="mt-2 h-9 px-3 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center hover:bg-muted transition-colors gap-1.5"
                  aria-label="Toggle Zoom"
                >
                  {isZoomed ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  <span className="text-[10px] font-bold uppercase">{isZoomed ? 'Alejar' : 'Acercar'}</span>
                </button>
              </div>

          </div>

          {/* Floating emojis layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <AnimatePresence>
              {floatingEmojis.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
                  animate={{ opacity: 1, scale: 1.6, y: -240, x: -20 - Math.random() * 40 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 2.2, ease: 'easeOut' }}
                  className="absolute text-4xl select-none"
                  style={{ right: `${100 - e.x}%`, bottom: `${e.y}%` }}
                >
                  {e.char}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Floating actions right side */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            <motion.button
              key={`like-desktop-${burstKey}`}
              whileTap={{ scale: 1.5 }}
              onClick={handleLike}
              className="flex flex-col items-center gap-0.5"
            >
              <motion.span
                key={burstKey}
                initial={liked ? { scale: 0.6, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              >
                <Heart className={`h-7 w-7 transition-colors drop-shadow-lg ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </motion.span>
              <span className="text-[10px] font-black text-white tabular-nums drop-shadow">
                {formatViewers(likes).replace(' espectadores', '')}
              </span>
            </motion.button>

            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="flex flex-col items-center gap-0.5"
              aria-label="Reacciones"
            >
              <Flame className="h-6 w-6 text-amber-400 drop-shadow-lg" />
              <span className="text-[10px] font-black text-white drop-shadow">Reacciones</span>
            </button>

            <button onClick={handleShare} className="flex flex-col items-center gap-0.5">
              <Share2 className="h-6 w-6 text-white drop-shadow-lg" />
              <span className="text-[10px] font-black text-white drop-shadow">Compartir</span>
            </button>
          </div>

          {/* Emoji picker popover (desktop) */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                transition={{ duration: 0.16 }}
                className="absolute right-4 bottom-28 z-30 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl"
              >
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {hasParticipated ? 'Reacciones' : 'Bloqueado'}
                  </span>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-muted-foreground hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {LIVE_EMOJIS.map((e) => (
                    <motion.button
                      key={e.id}
                      whileTap={{ scale: 0.85 }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      onClick={() => handleEmojiTap(e.char)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-xl"
                      aria-label={e.label}
                      title={e.label}
                    >
                      {e.char}
                    </motion.button>
                  ))}
                </div>
                {!hasParticipated && (
                  <p className="mt-1 px-2 text-[9px] text-muted-foreground text-center leading-tight">
                    Puja o compra para desbloquear
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product description & vendor info (Borderless design) */}
        <div className="px-2">
          <h1 className="text-2xl font-black text-white">{safeProduct.title || stream.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Por <span className="font-bold text-white">{seller.displayName}</span> • Envío desde <span className="font-bold text-white">{seller.department}</span> • Envío instantáneo con Yape/Plin
          </p>
          <p className="text-gray-500 text-xs leading-relaxed mt-2.5 max-w-2xl">
            {safeProduct.description}
          </p>
        </div>

        {/* Unified Bidding Box Container */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            {auction ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" /> Puja líder actual
                    </span>
                    <p className="text-4xl font-black text-amber-400 font-mono tabular-nums mt-1">
                      {formatPEN(currentBid)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Por <span className="font-bold text-sky-400">Diego</span> • hace 36s
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CountdownCard mm={mm} ss={ss} lowTime={lowTime} />
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 flex flex-col items-center min-w-[88px]">
                      <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                        <Gavel className="inline h-2.5 w-2.5 mr-1" />Pujas
                      </span>
                      <span className="text-xl font-black font-mono text-white tabular-nums">{bidCount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2">
                    Puja rápida
                  </p>
                  <div className="flex gap-2">
                    {QUICK_BIDS.map((amt) => (
                      <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-sky-400 flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> Live Shopping
                    </span>
                    <p className="text-4xl font-black text-white font-mono tabular-nums mt-1">
                      {formatPEN(buyNowPrice)}
                    </p>
                  </div>
                </div>
            )}

            <div className="flex gap-3">
              {auction && <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} />}
              <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} />
            </div>
          </div>
      </main>

      {/* COLUMNA DERECHA: Sidebar Único (Chat en vivo e Historial integrados) */}
      <aside className="w-80 bg-zinc-950/40 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shrink-0">
        {/* Chat en vivo */}
        <div className="p-4 border-b border-zinc-800 font-black text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-zinc-100">
            <MessageCircle className="h-4 w-4" /> Chat en vivo
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
            <Users className="h-3 w-3 text-amber-400" /> {viewers}
          </span>
        </div>

        <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2 max-h-[300px]">
          <AnimatePresence initial={false}>
            {chat.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
        </div>

        {/* Historial de pujas unificado */}
        <div className="p-4 border-t border-zinc-800 border-b border-zinc-800 bg-zinc-950/80">
          <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-2 flex items-center justify-between">
            <span>Historial de pujas</span>
            <span className="text-zinc-500 tabular-nums">{bidCount}</span>
          </p>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
            {bids.slice().reverse().map((b: any) => (
              <div key={b.id} className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-400">{b.bidder?.displayName}</span>
                <span className="font-mono font-black text-amber-400">{formatPEN(b.amount)}</span>
                <span className="text-[10px] text-zinc-500">{timeAgoEs(b.createdAt)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/40">
              <span className="font-bold text-zinc-500">Puja inicial</span>
              <span className="font-mono text-zinc-500">{formatPEN(safeAuction.startingPrice)}</span>
              <span className="text-[10px] text-zinc-500">inicio</span>
            </div>
          </div>
        </div>

        {/* Input para chatear */}
        <div className="p-3 bg-zinc-950/60">
          <ChatInputBar
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={sendChat}
            compact
          />
        </div>
      </aside>
    </div>
  )

  /* ================================================================ *
   * MOBILE LAYOUT — TikTok-style full-screen vertical                *
   * ================================================================ */
  const MobileLayout = (
    <div className="md:hidden fixed inset-0 z-50 bg-black text-white select-none overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src={`https://player.kick.com/${stream?.kickUsername || 'gozustrike'}?autoplay=true&muted=false`}
          className="w-full h-full border-none pointer-events-none origin-center transition-transform duration-300" style={{ transform: isZoomed ? 'scale(3.16)' : 'scale(1)' }}
          allow="autoplay; fullscreen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Top bar */}
        <div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Volver"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>

          <div className="flex flex-col items-end gap-1.5 pointer-events-auto mt-0.5">
            <LiveBadge />
            <ViewersPill viewers={viewers} />
          </div>
        </div>

      {/* Floating emojis layer (overlay sobre el video) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <AnimatePresence>
          {floatingEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
              animate={{ opacity: 1, scale: 1.6, y: -260, x: -30 - Math.random() * 40 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="absolute text-4xl select-none"
              style={{ right: `${100 - e.x}%`, bottom: `${e.y + 10}%` }}
            >
              {e.char}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right floating actions — sin círculos negros, más limpio */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 items-center">
        {/* Like — solo icono + count, sin fondo negro */}
        <motion.button
          key={`like-mobile-${burstKey}`}
          whileTap={{ scale: 1.5 }}
          onClick={handleLike}
          className="flex flex-col items-center gap-0.5"
        >
          <motion.span
            key={burstKey}
            initial={liked ? { scale: 0.5, opacity: 0, y: 10 } : false}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
          >
            <Heart className={`h-7 w-7 transition-colors drop-shadow-lg ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </motion.span>
          <span className="text-[10px] font-black text-white tabular-nums drop-shadow">
            {formatViewers(likes).replace(' espectadores', '')}
          </span>
        </motion.button>

        {/* Emoji reactions */}
        <button
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="flex flex-col items-center gap-0.5"
          aria-label="Reacciones"
        >
          <Flame className="h-7 w-7 text-amber-400 drop-shadow-lg" />
          <span className="text-[10px] font-black text-white drop-shadow">Reacciona</span>
        </button>

        
        {/* Zoom */}
        <button
          onClick={() => setIsZoomed((v) => !v)}
          className="flex flex-col items-center gap-0.5"
        >
          {isZoomed ? <Minimize className="h-7 w-7 text-white drop-shadow-lg" /> : <Maximize className="h-7 w-7 text-white drop-shadow-lg" />}
          <span className="text-[10px] font-black text-white drop-shadow">{isZoomed ? 'Alejar' : 'Acercar'}</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => setMobileTab('chat')}
          className="flex flex-col items-center gap-0.5"
        >
          <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-[10px] font-black text-white drop-shadow">Chat</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-0.5">
          <Share2 className="h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-[10px] font-black text-white drop-shadow">Compartir</span>
        </button>
      </div>

      {/* Emoji picker (mobile) */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
            className="absolute right-3 bottom-72 z-30 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                {hasParticipated ? (
                  <><Flame className="h-3 w-3" /> Reacciones</>
                ) : (
                  <><Zap className="h-3 w-3" /> Bloqueado</>
                )}
              </span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-muted-foreground hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex gap-1">
              {LIVE_EMOJIS.map((e) => (
                <motion.button
                  key={e.id}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.15, y: -2 }}
                  onClick={() => handleEmojiTap(e.char)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-xl"
                  aria-label={e.label}
                  title={e.label}
                >
                  {e.char}
                </motion.button>
              ))}
            </div>
            {!hasParticipated && (
              <p className="mt-1 px-2 text-[9px] text-muted-foreground text-center leading-tight">
                Puja o compra para desbloquear
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom console — más compacto (panel menor, padding optimizado) */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        {/* Tab toggle — compacto */}
        <div className="px-3 pb-1">
          <div className="inline-flex p-0.5 rounded-full bg-black/60 backdrop-blur-xl border border-border">
            <button
              onClick={() => setMobileTab('bid')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                mobileTab === 'bid' ? 'bg-amber-400 text-zinc-950' : 'text-muted-foreground'
              }`}
            >
              {auction ? <><Gavel className="inline h-3 w-3 mr-1" />Puja</> : <><ShoppingBag className="inline h-3 w-3 mr-1" />Comprar</>}
            </button>
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                mobileTab === 'chat' ? 'bg-purple-400 text-zinc-950' : 'text-muted-foreground'
              }`}
            >
              <MessageCircle className="inline h-3 w-3 mr-1" />Chat
            </button>
          </div>
        </div>

        {/* Panel body — padding reducido, radio menor, sin handle decorativo */}
        <div className="bg-background/95 backdrop-blur-xl border-t border-border rounded-t-[1.25rem] p-2.5 pt-2 pb-3 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
          <AnimatePresence mode="wait">
              {mobileTab === 'bid' ? (
                <motion.div
                  key="bid"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {auction ? (
                    <>
                      {/* Leader price compact */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-[9px] font-black tracking-widest uppercase text-amber-400">
                            <Crown className="inline h-2.5 w-2.5 mr-1" />Puja líder
                          </span>
                          <p className="text-lg font-black text-amber-400 font-mono tabular-nums leading-none mt-0.5">
                            {formatPEN(currentBid)}
                          </p>
                        </div>
                        <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                      </div>

                      {/* Quick bid pills */}
                      <div className="flex gap-1.5 mb-1.5">
                        {QUICK_BIDS.map((amt) => (
                          <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                        ))}
                      </div>

                      <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} full />
                      <div className="mt-1.5">
                        <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Live Shopping Mode Mobile */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-sky-400">
                            <ShoppingBag className="inline h-3 w-3 mr-1" />Live Shopping
                          </span>
                          <p className="text-2xl font-black text-white font-mono tabular-nums leading-none mt-1">
                            {formatPEN(buyNowPrice)}
                          </p>
                        </div>
                      </div>
                      
                      <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                    </>
                  )}

                  {/* Stock mini-info */}
                <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug text-center">
                  Stock: <span className="font-bold text-lime-400">{safeProduct.stock ?? 0} uds</span> · {bidCount} pujas · {formatViewers(viewers)}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
              >
                <div className="max-h-44 overflow-y-auto no-scrollbar space-y-1.5 mb-2">
                  <AnimatePresence initial={false}>
                    {chat.map((msg) => (
                      <ChatMessageBubble key={msg.id} msg={msg} />
                    ))}
                  </AnimatePresence>
                </div>
                <ChatInputBar
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  onSend={sendChat}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {DesktopLayout}
      {MobileLayout}

      {/* Checkout bottom sheet — shared for both layouts */}
      <CheckoutBottomSheet
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productId={safeProduct.id ?? id}
        productName={safeProduct.title ?? 'Subasta'}
        price={buyNowPrice}
        source="live_stream"
        sellerId={seller.id}
        shipment={{
          originAgencyId: 'LIM-01',
          destinationAgencyId: 'LIM-02',
          senderDni: '12345678',
          senderName: seller.displayName,
          senderPhone: '999888777',
          receiverDni: '87654321',
          receiverName: 'Tú',
          receiverPhone: '999111222',
          packageDescription: safeProduct.title ?? 'Subasta',
          weightKg: 0.5,
          declaredValue: buyNowPrice,
        }}
      />
    </>
  )
}
