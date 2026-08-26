'use client'

import { endLiveStream } from '@/app/vender/actions'
import { useTransition } from 'react'
import { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';

import * as React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PowerOff, ChevronLeft, ChevronRight, Flame, Eye, Heart, Share2, ShoppingBag,
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

export default function LiveRoomClient({ stream, auction, product, seller, initialChat, currentUserId }: { stream: any, auction: any, product: any, seller: any, initialChat?: ChatMessage[], currentUserId?: string }) {
  const [isEnding, startEnding] = useTransition();
  const isSeller = currentUserId === seller.id;

  const handleEndStream = () => {
    startEnding(async () => {
      try {
        await endLiveStream(stream.id);
        router.push('/');
      } catch(e) {
        console.error(e);
      }
    });
  };

    const router = useRouter()
  const id = stream?.id || 'demo'

  
  const safeAuction = auction || { id: '', currentPrice: 0, bidCount: 0, buyNowPrice: 0, startingPrice: 0, bidIncrement: 2 };
  const safeProduct = product || { title: 'Esperando producto...', description: 'El vendedor no ha iniciado una subasta.', stock: 0 };
  const [currentBid, setCurrentBid] = React.useState(safeAuction.currentPrice)
  const supabase = React.useMemo(() => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), [])

  React.useEffect(() => {
      // Chat Realtime (Always active)
      const chatChannel = supabase.channel(`chat_${id}`, {
        config: {
          presence: {
            key: 'user_' + Math.random().toString(36).substring(7),
          },
        },
      })
      
      
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          // prevent duplicates if it's our own message bouncing back
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      })
      
      chatChannel.on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState()
        let count = 0
        for (const key in state) {
          count += state[key].length
        }
        setViewers(count)
      })

      chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({ online: true })
        }
      })

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
  const [viewers, setViewers] = React.useState(stream?.viewerCount ?? 0)
  const [likes, setLikes] = React.useState(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`likes_${id}`)
        if (saved) return parseInt(saved, 10)
      }
      return stream?.likeCount ?? 1240
    })

    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`likes_${id}`, likes.toString())
      }
    }, [likes, id])
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [chat, setChat] = React.useState<ChatMessage[]>(initialChat || [])

    
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

    // Save to DB
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: 'Comprador',
          text: msg.text,
          color: msg.color,
          isBot: false
        })
      })
    } catch(e) {}

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
  
  const videoId = stream?.streamProviderId || stream?.youtubeLiveId;
  const isValidYoutubeId = videoId && videoId.length === 11;
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0`;

    return (
    <>
      <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-background overflow-hidden text-foreground">
        
        {/* ========================================================
            COLUMNA IZQUIERDA: VIDEO (PC) / ARRIBA (MOBILE)
            ======================================================== */}
        <div className="w-full md:w-2/3 lg:w-3/4 h-[40vh] md:h-[100dvh] shrink-0 bg-black relative flex flex-col border-b md:border-b-0 md:border-r border-white/5 z-20">
          
          {/* TOP BAR: Back & Finish Buttons */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors text-white">
                <ChevronLeft className="h-6 w-6" />
              </button>
              {isSeller && (
                <button 
                  onClick={handleEndStream}
                  disabled={isEnding}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 hover:bg-red-500 transition-colors text-white font-bold text-xs disabled:opacity-50 shadow-lg"
                >
                  <PowerOff className="h-4 w-4" />
                  {isEnding ? 'Cerrando...' : 'Finalizar Transmisión'}
                </button>
              )}
            </div>
          </div>

          {/* REPRODUCTOR YOUTUBE */}
          <div className="flex-1 w-full relative flex items-center justify-center bg-black">
            {isValidYoutubeId ? (
              <iframe
                src={youtubeUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-white/50 bg-zinc-900">
                <svg className="w-12 h-12 mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Transmisión no disponible</p>
                <p className="text-xs text-white/30 mt-1">ID inválido o stream finalizado</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            COLUMNA DERECHA: INTERACCION (PC) / ABAJO (MOBILE)
            ======================================================== */}
        <div className="flex-1 md:w-1/3 lg:w-1/4 flex flex-col min-h-0 bg-zinc-950 relative z-10 w-full shadow-2xl border-l border-border">
          
          {/* Header Vendedor (Siempre visible) */}
          <div className="shrink-0 p-3 border-b border-white/10 hidden md:flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10">
            <SellerPill seller={seller} initial={initial} />
            <div className="flex items-center gap-3">
              <ViewersPill viewers={viewers} />
              <LiveBadge size="sm" />
            </div>
          </div>
          
          {/* Header Vendedor Mobile */}
          <div className="shrink-0 p-3 border-b border-white/10 flex md:hidden items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10">
             <SellerPill seller={seller} initial={initial} />
             <div className="flex items-center gap-3">
               <ViewersPill viewers={viewers} />
               <LiveBadge size="sm" />
             </div>
          </div>

          {/* Zona 2: Producto y Pujas (FIJO) */}
          <div className="shrink-0 bg-zinc-900/20 border-b border-white/5 p-3 flex flex-col gap-3">
            <div className="flex gap-4 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
              <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
                  <h2 className="font-bold text-sm line-clamp-2 leading-tight text-white">{safeProduct.title}</h2>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Última Puja</span>
                    <span className="font-black text-amber-400 text-lg leading-none mt-0.5">{formatPEN(currentBid)}</span>
                  </div>
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                </div>
              </div>
            </div>
            
            {/* Opciones Rápidas de Puja */}
            {safeAuction.id && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                {[safeAuction.bidIncrement, safeAuction.bidIncrement * 2, safeAuction.bidIncrement * 3].map(amt => (
                  <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                ))}
              </div>
            )}
          </div>

          {/* Zona 3: Chat Messages (SCROLLABLE, ESPACIO RESTANTE) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar bg-zinc-950/50">
            <div className="flex-1 flex flex-col justify-end">
              <div className="space-y-3 flex flex-col-reverse">
                {[...chat].reverse().map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
              </div>
            </div>
          </div>

          {/* Zona 4: Footer Fijo de Acción */}
          <div className="shrink-0 p-3 pt-4 border-t border-white/10 bg-zinc-950 pb-safe">
            <div className="flex gap-3 mb-3">
               <div className="flex-1 flex gap-2">
                 {safeAuction.id ? (
                   <PujarButton increment={safeAuction.bidIncrement} onBid={executeRealtimeBid} full />
                 ) : (
                   <button onClick={() => setShowCheckout(true)} className="flex-1 h-12 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg">
                     <ShoppingBag className="h-5 w-5" /> Comprar Ya - {formatPEN(Number(safeProduct?.basePrice) || Number(safeProduct?.price) || 0)}
                   </button>
                 )}
               </div>
               <button onClick={handleLike} className="h-12 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform shrink-0">
                 <Heart className={`h-6 w-6 ${liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
               </button>
            </div>
            
            {/* Chat Input */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-1.5 py-1.5 focus-within:border-white/20 transition-colors">
              <MessageCircle className="h-5 w-5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Escribe en el chat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none min-w-0"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="h-9 w-9 rounded-xl bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 disabled:opacity-50 disabled:bg-zinc-800 transition-colors shrink-0"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          </div>

        </div>
      </div>
      
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
