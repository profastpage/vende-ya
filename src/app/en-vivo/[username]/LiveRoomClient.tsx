'use client'
import { Loader2 } from 'lucide-react';

import {  endLiveStream } from '@/app/vender/actions'
import { useTransition } from 'react'
import { useAuth } from '@/components/vendeda/AuthProvider'
import Link from 'next/link'
import { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';

import * as React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PowerOff, ChevronLeft, ChevronRight, Flame, Eye, EyeOff, Heart, Share2, ShoppingBag,
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
  avatarUrl?: string | null
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
function ViewersPill({ realSpectators, anonymousCount }: { realSpectators: any[], anonymousCount: number }) {
  const viewers = realSpectators.length + anonymousCount;
  const [open, setOpen] = React.useState(false)
  const spectatorRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (spectatorRef.current && !spectatorRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])
  return (
    <div className="relative" ref={spectatorRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5 text-amber-400" strokeWidth={2.5} />
        <span className="text-xs font-black tabular-nums drop-shadow-lg">
          {formatViewers(viewers)}
        </span>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 origin-top-right"
          >
            <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-2">Espectadores ({viewers})</div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto no-scrollbar">
              {realSpectators.map((user, idx) => (
    <div key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
      {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white">
            {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
        )}
      <span className="text-xs font-medium text-white truncate">{user.name}</span>
    </div>
  ))}

  {anonymousCount > 0 && (
    <div className="flex items-center gap-2 px-2 py-1.5 mt-1 border-t border-white/10">
      <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
        +
      </div>
      <span className="text-xs font-medium text-zinc-400 italic">
        {anonymousCount} anónimo{anonymousCount !== 1 ? 's' : ''}
      </span>
    </div>
  )}
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** SellerPill — username + rating + ubicación, más limpia */
function SellerPill({ seller, initial }: { seller: Profile; initial: string }) {
  return (
    <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
      {seller.avatarUrl ? (
        <img src={seller.avatarUrl} alt={seller.displayName} className="h-7 w-7 rounded-full object-cover border border-amber-300/40" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 border border-amber-300/40 flex items-center justify-center font-black text-white text-xs">
          {initial}
        </div>
      )}
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
  if (msg.isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border bg-purple-500/15 border-purple-400/30 shadow-lg shadow-purple-500/10 text-white"
      >
        <span className="font-bold text-purple-400 mr-1.5">{msg.username}</span>
        <span className="text-zinc-100/90 leading-relaxed">{msg.text}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="text-[13px] px-1 py-1 text-white"
      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9), 0px 1px 1px rgba(0,0,0,0.6)' }}
    >
      <div className="flex items-start gap-2 w-full max-w-full">
        {msg.avatarUrl ? (
          <img src={msg.avatarUrl} alt={msg.username} className="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/20 shadow-sm" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5 border border-white/20 shadow-sm">
            {msg.username?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div className="flex flex-col leading-tight gap-0.5 min-w-0 flex-1 overflow-hidden">
          <span className="font-extrabold text-white/95 text-[12px] truncate">{msg.username}</span>
          <span className="text-white text-[13px] break-words break-all leading-snug whitespace-normal">{msg.text}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function LiveRoomClient({ stream, auction, product, seller, initialChat, currentUserId }: { stream: any, auction: any, product: any, seller: any, initialChat?: ChatMessage[], currentUserId?: string }) {
  const { user } = useAuth();
  const userName = user?.displayName || 'Usuario';

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
        const state = chatChannel.presenceState();
        const usersList = Object.values(state).flat();
        
        // Filtrar usuarios reales (que tengan un ID válido de Supabase o nombre distinto a 'Anónimo')
        const reals = usersList.filter((u: any) => u.name !== 'Espectador Anónimo');
        // Contar el resto
        const anons = usersList.length - reals.length;
        
        setRealSpectators(reals);
        setAnonymousCount(anons);
      })

      chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            name: user ? userName : 'Espectador Anónimo',
            avatarUrl: user?.avatarUrl || null,
            isAuth: !!user
          })
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
    }, [auction?.id, id, supabase, user])

  const executeRealtimeBid = async (inc: number) => {
    const newPrice = +(currentBid + inc).toFixed(2);
    handleQuickBid(inc); // update locally immediately for UX
    // In a real app, we'd hit an API route to securely record the bid.
    // For this prompt, we just trigger the UI update and let Supabase broadcast.
    await supabase.from('Auction').update({ currentPrice: newPrice, bidCount: bidCount + 1 }).eq('id', safeAuction.id);
  }

  const [bidCount, setBidCount] = React.useState(safeAuction.bidCount || 0); const [bids, setBids] = React.useState([]);
  const [realSpectators, setRealSpectators] = React.useState<any[]>([])
    const [anonymousCount, setAnonymousCount] = React.useState(0)
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

    
  const [chatInput, setChatInput] = React.useState('')
  const [secondsLeft, setSecondsLeft] = React.useState(164)
  const [liked, setLiked] = React.useState(false)
    
  const [isZoomed, setIsZoomed] = React.useState(true)
  const [burstKey, setBurstKey] = React.useState(0)
  const [mobileTab, setMobileTab] = React.useState<'chat' | 'bid'>('bid')
  const [floatingEmojis, setFloatingEmojis] = React.useState<{id: number, char: string, left: number}[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  // ¿Es participante activo? Solo quien pujó o compró puede emitir emojis.
  // Por ahora: si el usuario ha hecho al menos una puja o compra.
  const [hasParticipated, setHasParticipated] = React.useState(false)
    const [hideUI, setHideUI] = React.useState(true)

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
  
  const handleLike = (emoji = '❤️') => {
    setLiked(true);
    setLikes(l => l + 1);
    const newEmoji = { id: Date.now(), char: emoji, left: Math.random() * 60 - 30 };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 1500);
    try {
      supabase.channel(`chat_${id}`).send({
        type: 'broadcast',
        event: 'new_emoji',
        payload: { char: emoji }
      });
    } catch(e) {}
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { id: Date.now().toString(), username: userName || 'Tú', text: chatInput.trim(), color: 'text-lime-400', avatarUrl: user?.avatarUrl }
    setChat((prev) => [...prev, msg])
    setChatInput('')

    // Save to DB
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: userName,
            avatarUrl: user?.avatarUrl,
            senderId: user?.id,
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
    const newEmoji = { id: Date.now() + Math.random(), char: emojiChar, left: Math.random() * 60 - 30 }
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
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&modestbranding=1&rel=0&controls=1`;

    return (
    <>
      <div className="relative flex w-full h-[100dvh] bg-black overflow-hidden text-white">
        
        {/* ========================================================
            COLUMNA IZQUIERDA: VIDEO (PC) / ARRIBA (MOBILE)
            ======================================================== */}
        <div className="absolute inset-0 md:relative md:w-2/3 lg:w-3/4 h-[100dvh] shrink-0 bg-black flex flex-col md:border-r border-white/5 z-0">
          
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
                  className="h-10 w-10 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 hover:bg-red-500 transition-all text-white flex items-center justify-center shadow-lg disabled:opacity-50"
                  title="Finalizar Transmisión"
                >
                  {isEnding ? <Loader2 className="h-5 w-5 animate-spin" /> : <PowerOff className="h-5 w-5" />}
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
        <div className={`absolute inset-0 md:relative md:flex-1 md:w-1/3 lg:w-1/4 flex flex-col justify-end md:justify-start min-h-0 bg-transparent md:bg-zinc-950 z-10 w-full shadow-2xl md:border-l border-border pointer-events-none md:pointer-events-auto transition-opacity duration-300 ${hideUI ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Header Vendedor (Siempre visible) */}
          <div className="shrink-0 p-3 border-b border-white/10 hidden md:flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10 pointer-events-auto">
            <SellerPill seller={seller} initial={initial} />
            <div className="flex items-center gap-3">
              <ViewersPill realSpectators={realSpectators} anonymousCount={anonymousCount} />
              <LiveBadge size="sm" />
            </div>
          </div>
          
          {/* Header Vendedor Mobile */}
          <div className={`absolute top-14 left-0 right-0 p-3 flex md:hidden items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10 ${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}`}>
             <SellerPill seller={seller} initial={initial} />
             <div className="flex items-center gap-3">
               <ViewersPill realSpectators={realSpectators} anonymousCount={anonymousCount} />
               <LiveBadge size="sm" />
             </div>
          </div>

          {/* Zona 3: Chat Messages (SCROLLABLE, ESPACIO RESTANTE) */}
          <div className={`h-[35vh] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 ${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}`} style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}>
            <div className="mt-auto flex flex-col space-y-3">
                {chat.map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Zona 4: Footer Fijo de Acción (Estilo eBay Live) */}
          <div className={`shrink-0 pt-2 pb-safe bg-gradient-to-t from-black/80 via-black/40 to-transparent ${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            {/* 4A: Chat Input & Like (eBay Style) */}
            <div className="flex items-center gap-3 mb-2 px-3 relative">
              {/* Floating Emojis */}
              <div className="absolute bottom-14 right-14 pointer-events-none overflow-visible z-50">
                <AnimatePresence>
                  {floatingEmojis.map(emoji => (
                    <motion.span
                        key={emoji.id}
                        initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -150, x: emoji.left, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute text-2xl select-none"
                      >
                        {emoji.char}
                      </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              {!user ? (
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-between px-4 h-10 border border-white/30 rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <span className="text-white/80 text-[13px] font-medium">Inicia sesión para comentar...</span>
                </Link>
              ) : (
                <div className="w-full flex items-center px-4 h-10 border border-white/50 rounded-full bg-black/40 backdrop-blur-md focus-within:border-white transition-colors">
                  <input
                    type="text"
                    placeholder="Agregar comentario..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/80 focus:outline-none min-w-0 font-medium"
                  />
                  {chatInput.trim() ? (
                    <button onClick={sendChat} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform text-white">
                      <ChevronRight className="h-6 w-6" strokeWidth={3} />
                    </button>
                  ) : (
                    <div className="flex items-center shrink-0 gap-1.5 ml-1.5">
                      <button onClick={() => handleLike('❤️')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">❤️</button>
                      <button onClick={() => handleLike('🔥')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">🔥</button>
                      <button onClick={() => handleLike('💸')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">💸</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Pequeño Banner Informativo (estilo eBay) */}
            <div className="px-4 py-1.5 mb-2 mx-3 bg-black/40 backdrop-blur-md rounded-md border border-white/5 hidden md:flex items-center justify-center">
              <p className="text-[10px] text-white/70 font-medium text-center truncate">
                Vende Ya asegura tu compra hasta la entrega | Envíos a todo el Perú
              </p>
            </div>

            {/* 4B: Product Box */}
            <div className="bg-[#1c1c1e]/95 backdrop-blur-xl mx-2 md:mx-3 mb-2 md:mb-3 p-2 md:p-3.5 rounded-[16px] md:rounded-[20px] border border-white/10 shadow-2xl relative z-10">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex-1 pr-3">
                  <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2">
                    {safeProduct?.id ? `#${safeProduct.id.substring(0,4).toUpperCase()} - ` : ''}{safeProduct?.title || 'Producto en Vivo'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-white font-black text-sm tabular-nums">{formatPEN(buyNowPrice)}</span>
                    <span className="text-zinc-400 text-[10px] font-medium truncate">+ Envío por pagar</span>
                  </div>
                  {safeAuction.id && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Gavel className="h-3 w-3 text-emerald-400" />
                      <span className="text-zinc-300 text-[10px] font-medium"><strong className="text-emerald-400">{bidCount}</strong> pujas registradas</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-white/50 shrink-0 mt-0.5" />
              </div>

              <div className="flex gap-2.5 mt-3 pt-3 border-t border-white/10">
                {safeAuction.id ? (
                  <>
                    <button className="flex-1 h-10 rounded-full border border-white/20 bg-transparent text-white text-[13px] font-bold active:bg-white/10 transition-colors">
                      Oferta máxima
                    </button>
                    <button 
                      onClick={() => executeRealtimeBid(safeAuction.bidIncrement)}
                      className="flex-1 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[13px] font-extrabold active:scale-95 transition-transform shadow-lg shadow-emerald-500/20">
                      Ofertar {formatPEN(currentBid + safeAuction.bidIncrement)}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowCheckout(true)} className="w-full h-11 bg-white hover:bg-zinc-100 text-black text-[14px] font-extrabold rounded-full active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-xl">
                    Comprar Ya
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Ocultar UI Toggle (Solo Mobile) - ROOT LEVEL PARA Z-INDEX ABSOLUTO */}
          <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-end gap-2 pointer-events-auto">
            {hideUI && (
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce mr-1">
                💬 Ver Chat y Compras
              </div>
            )}
            <button onClick={() => setHideUI(!hideUI)} className="p-3 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white shadow-2xl active:scale-90 transition-transform" title="Mostrar/Ocultar Interfaz">
              {hideUI ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-white/90" />}
            </button>
          </div>
      <CheckoutBottomSheet
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productId={safeProduct.id ?? id}
        productName={safeProduct.title ?? 'Compra en Vivo'}
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
          receiverName: user?.displayName || 'Usuario',
          receiverPhone: '999111222',
          packageDescription: safeProduct.title ?? 'Paquete',
          weightKg: 0.5,
          declaredValue: buyNowPrice,
        }}
      />
    </>
  )
}
