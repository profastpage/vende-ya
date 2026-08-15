'use client'

import * as React from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Flame, Eye, Heart, Share2, ShoppingBag,
  MessageCircle, Send, Gavel, Clock, BadgeCheck, ShieldCheck,
  Bot, Users, Crown, MapPin, Package, Star, Zap, X,
} from 'lucide-react'
import type { Profile, Product, Auction } from '@/lib/vendeda/types'
import {
  MOCK_STREAMS, MOCK_AUCTION, MOCK_BIDS,
  MOCK_PROFILES, MOCK_TRENDING_AUCTIONS,
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

const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', username: 'María', text: '¡Mío! Reservo talla M en terracota 🙌', color: 'text-amber-400' },
  { id: '2', username: 'YaBot AI', text: 'Quedan 25 unidades en stock. Envío a todo Perú desde S/.8 🤖', color: 'text-purple-400', isBot: true },
  { id: '3', username: 'Diego', text: 'S/. 38! 💪 voy por más', color: 'text-sky-400' },
  { id: '4', username: 'Carla', text: 'Yape listo, ¿aceptan Plin también?', color: 'text-lime-400' },
  { id: '5', username: 'YaBot AI', text: 'Sí Carla, aceptamos Yape, Plin y tarjeta. Pago 100% protegido 💜', color: 'text-purple-400', isBot: true },
]

const QUICK_BIDS = [2, 5, 10]

/* Emojis disponibles para participantes (pujadores/compradores) */
const LIVE_EMOJIS = [
  { id: 'fire',      char: '🔥', label: 'Fuego'    },
  { id: 'lightning', char: '⚡', label: 'Trueno'   },
  { id: 'heart',     char: '💜', label: 'Corazón'  },
  { id: 'clap',      char: '👏', label: 'Aplauso'  },
  { id: 'star',      char: '⭐', label: 'Estrella' },
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
        <span className="text-[10px] text-zinc-300 flex items-center gap-1">
          <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-amber-300">{seller.rating.toFixed(1)}</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-300">{seller.department}</span>
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
          : 'bg-white/5 border-white/5'
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
    <div className={`flex items-center gap-2 ${compact ? '' : 'px-3 py-2.5'} bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`}>
      <MessageCircle className="h-4 w-4 text-zinc-400 shrink-0" />
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
        className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30"
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
          ? 'bg-gradient-to-br from-rose-500/30 to-rose-700/30 border-rose-400/50'
          : 'bg-white/5 border-white/10'
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
      className="flex-1 rounded-full bg-white/5 hover:bg-amber-400/15 border border-white/10 hover:border-amber-400/40 px-3 py-2 text-xs font-black text-amber-300 transition-colors flex items-center justify-center gap-0.5"
    >
      <span className="text-zinc-500">+</span>S/{amount}
    </motion.button>
  )
}

function PujarButton({ increment, onBid, full = false }: { increment: number; onBid: (n: number) => void; full?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      animate={{ boxShadow: ['0 0 20px rgba(245,158,11,0.4)', '0 0 32px rgba(217,70,239,0.5)', '0 0 20px rgba(245,158,11,0.4)'] }}
      transition={{ duration: 2.4, repeat: Infinity }}
      onClick={() => onBid(increment)}
      className={`${full ? 'w-full' : 'flex-1'} relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-fuchsia-500 text-zinc-950 font-black uppercase tracking-wider text-sm py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30`}
    >
      <Gavel className="h-4 w-4" />
      Pujar ahora
      <span className="ml-1 text-[10px] bg-zinc-950/30 px-1.5 py-0.5 rounded-md">+S/{increment}</span>
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
      className={`${full ? 'w-full' : ''} bg-transparent border border-white/15 hover:border-amber-400/40 text-white text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-colors`}
    >
      <ShoppingBag className="h-4 w-4 text-amber-400" />
      <span className="text-zinc-300">Comprar ya</span>
      <span className="text-white font-mono font-black">{formatPEN(buyNowPrice)}</span>
    </motion.button>
  )
}

/* ---------------- Main page ---------------- */

export default function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()

  const stream = MOCK_STREAMS.find((s) => s.id === id)
  const auction: Auction = MOCK_TRENDING_AUCTIONS.find((a) => a.streamId === id) ?? MOCK_AUCTION
  const seller: Profile = stream?.seller ?? MOCK_PROFILES[0]
  const product: Product | undefined = auction.product

  const [currentBid, setCurrentBid] = React.useState(auction.currentPrice)
  const [bidCount, setBidCount] = React.useState(auction.bidCount || MOCK_BIDS.length)
  const [viewers] = React.useState(stream?.viewerCount ?? 248)
  const [likes, setLikes] = React.useState(stream?.likeCount ?? 1240)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [chat, setChat] = React.useState<ChatMessage[]>(INITIAL_CHAT)
  const [chatInput, setChatInput] = React.useState('')
  const [secondsLeft, setSecondsLeft] = React.useState(164)
  const [liked, setLiked] = React.useState(false)
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

  const handleLike = () => {
    setLiked((v) => !v)
    setLikes((l) => (liked ? Math.max(0, l - 1) : l + 1))
    setBurstKey((k) => k + 1)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    setChat((prev) => [
      ...prev,
      { id: Date.now().toString(), username: 'Tú', text: chatInput.trim(), color: 'text-lime-400' },
    ])
    setChatInput('')
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

  if (!stream) notFound()

  const thumbnail = stream.thumbnailUrl ?? product?.images?.[0] ?? ''
  const buyNowPrice = auction.buyNowPrice ?? currentBid + 50
  const initial = seller.displayName?.slice(0, 2).toUpperCase() ?? 'VY'

  /* ================================================================ *
   * DESKTOP LAYOUT — 3 columns (55% video / 25% auction / 20% chat)   *
   * ================================================================ */
  const DesktopLayout = (
    <div className="hidden md:grid md:grid-cols-[55fr_25fr_20fr] h-[calc(100vh-4rem)] w-full gap-3 p-3 bg-black text-white">
      {/* ---------------- COL 1: VIDEO ---------------- */}
      <section className="relative min-w-0 flex flex-col">
        <div
          className="absolute -inset-6 -z-10 blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d946ef 45%, #f43f5e 100%)' }}
        />
        <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5 bg-zinc-950">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

          {/* Top overlays */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-3 z-20">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.back()}
                className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Volver"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <SellerPill seller={seller} initial={initial} />
            </div>
            <div className="flex flex-col items-end gap-2">
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
          <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-3">
            {/* Like — solo icono + count, sin círculo negro */}
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

            {/* Emoji reactions button */}
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="flex flex-col items-center gap-0.5"
              aria-label="Reacciones"
            >
              <Flame className="h-6 w-6 text-amber-400 drop-shadow-lg" />
              <span className="text-[10px] font-black text-white drop-shadow">Reacciones</span>
            </button>

            <button className="flex flex-col items-center gap-0.5">
              <Share2 className="h-6 w-6 text-white drop-shadow-lg" />
              <span className="text-[10px] font-black text-white drop-shadow">Compartir</span>
            </button>

            <button
              onClick={() => setMobileTab('chat')}
              className="flex flex-col items-center gap-0.5"
            >
              <MessageCircle className="h-6 w-6 text-white drop-shadow-lg" />
              <span className="text-[10px] font-black text-white drop-shadow">Chat</span>
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
                className="absolute right-4 bottom-44 z-30 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl"
              >
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {hasParticipated ? 'Reacciones' : 'Bloqueado'}
                  </span>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-zinc-500 hover:text-white"
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
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-xl"
                      aria-label={e.label}
                      title={e.label}
                    >
                      {e.char}
                    </motion.button>
                  ))}
                </div>
                {!hasParticipated && (
                  <p className="mt-1 px-2 text-[9px] text-zinc-500 text-center leading-tight">
                    Puja o compra para desbloquear
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stream title + product caption */}
          <div className="absolute inset-x-0 bottom-0 p-5 z-10">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                  <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 flex flex-col items-center min-w-[88px]">
                    <span className="text-[9px] font-black tracking-widest uppercase text-zinc-400">
                      <Gavel className="inline h-2.5 w-2.5 mr-1" />Pujas
                    </span>
                    <span className="text-xl font-black font-mono text-white tabular-nums">{bidCount}</span>
                  </div>
                </div>
                <h2 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
                  {stream.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-300 line-clamp-1">
                  {product?.title} · Stock {product?.stock ?? 0} uds · Envío desde {seller.department}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- COL 2: AUCTION PANEL ---------------- */}
      <section className="relative min-w-0 flex flex-col bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
              <Flame className="h-3.5 w-3.5" /> Subasta en vivo
            </span>
            <LiveBadge size="sm" />
          </div>
          <h3 className="mt-1 text-base font-black text-white leading-tight line-clamp-2">
            {product?.title}
          </h3>
          <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
            Edición limitada del catálogo de {seller.displayName}. Cada puja incrementa el precio en S/{auction.bidIncrement}. La puja más alta al cerrar el cronómetro gana el producto. Envío inmediato a todo Perú con Shalom y Olva.
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
          {/* Leader price card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-4 border border-amber-400/20"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(34,19,94,0.5) 60%, rgba(9,9,11,0.9) 100%)' }}
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-amber-400/40 blur-3xl" />
            <div className="relative">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 flex items-center gap-1">
                <Crown className="h-3 w-3" /> Puja líder
              </span>
              <p className="mt-1 text-4xl font-black text-amber-400 font-mono tabular-nums drop-shadow-lg">
                {formatPEN(currentBid)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-300">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 border border-sky-300/40 flex items-center justify-center text-[9px] font-black text-white">
                  D
                </div>
                <span className="font-bold text-sky-400">Diego</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">hace 36s</span>
              </div>
            </div>
          </motion.div>

          {/* Countdown */}
          <CountdownCard mm={mm} ss={ss} lowTime={lowTime} />

          {/* Quick bid pills */}
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 mb-2">
              Puja rápida
            </p>
            <div className="flex gap-2">
              {QUICK_BIDS.map((amt) => (
                <BidPill key={amt} amount={amt} onBid={handleQuickBid} />
              ))}
            </div>
            <p className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
              Toca un monto para subir tu puja al instante. Mientras más alta sea tu oferta, más probabilidades de ganar al cerrar el cronómetro. Tu puja es pública y se notifica a todos los espectadores en tiempo real.
            </p>
          </div>

          {/* Primary CTA */}
          <PujarButton increment={auction.bidIncrement || 2} onBid={handleQuickBid} full />

          {/* Secondary CTA */}
          <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />

          {/* Product details */}
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3 space-y-2">
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400">
              Detalles del producto
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Package className="h-3.5 w-3.5 text-amber-400" /> Stock: {product?.stock ?? 0} uds
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-fuchsia-400" /> {product?.shippingFrom ?? seller.department}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Envío {product?.shipsNationwide ? 'nacional' : 'local'}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> {seller.rating.toFixed(1)} ({seller.ratingsCount})
              </div>
            </div>
            <p className="pt-2 border-t border-white/5 text-[11px] text-zinc-400 leading-relaxed">
              {product?.description}
            </p>
          </div>

          {/* Payment methods */}
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2">
              Métodos de pago aceptados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product?.paymentMethods.map((m) => (
                <span
                  key={m}
                  className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 capitalize"
                >
                  {m === 'card' ? 'Tarjeta' : m === 'transfer' ? 'Transferencia' : m}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-zinc-500 leading-relaxed">
              Todos los pagos están protegidos por Vende Ya con liberación escalonada al confirmar el envío. Si el producto no llega, reembolso garantizado en menos de 48 horas hábiles.
            </p>
          </div>

          {/* Bid history */}
          <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
            <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2">
              Historial de pujas
            </p>
            <div className="space-y-1.5">
              {MOCK_BIDS.slice().reverse().map((b) => (
                <div key={b.id} className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-sky-400">{b.bidder?.displayName}</span>
                  <span className="font-mono font-black text-amber-400">{formatPEN(b.amount)}</span>
                  <span className="text-zinc-500">{timeAgoEs(b.createdAt)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                <span className="font-bold text-zinc-400">Puja inicial</span>
                <span className="font-mono text-zinc-500">{formatPEN(auction.startingPrice)}</span>
                <span className="text-zinc-600">inicio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- COL 3: LIVE CHAT ---------------- */}
      <section className="relative min-w-0 flex flex-col bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-400">
              <MessageCircle className="h-3.5 w-3.5" /> Chat en vivo
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
              <Users className="h-3 w-3 text-amber-400" /> {viewers} viendo
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
            Conversemos en tiempo real. YaBot AI modera el chat y responde dudas sobre tallas, stock y envíos. Sé respetuoso con la comunidad de Vende Ya.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar">
          <AnimatePresence initial={false}>
            {chat.map((msg) => (
              <ChatMessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="shrink-0 px-3 py-3 border-t border-white/5 bg-zinc-950">
          <ChatInputBar
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={sendChat}
          />
          <p className="mt-1.5 text-[9px] text-zinc-600 text-center">
            Pulsa enter para enviar · YaBot AI responde automático
          </p>
        </div>
      </section>
    </div>
  )

  /* ================================================================ *
   * MOBILE LAYOUT — TikTok-style full-screen vertical                *
   * ================================================================ */
  const MobileLayout = (
    <div className="md:hidden fixed inset-0 z-50 bg-black text-white select-none overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 gap-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <SellerPill seller={seller} initial={initial} />
        </div>

        <div className="flex flex-col items-end gap-2">
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
      <div className="absolute right-3 bottom-40 z-20 flex flex-col gap-4 items-center">
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

        {/* Chat */}
        <button
          onClick={() => setMobileTab('chat')}
          className="flex flex-col items-center gap-0.5"
        >
          <MessageCircle className="h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-[10px] font-black text-white drop-shadow">Chat</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-0.5">
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
            className="absolute right-3 bottom-72 z-30 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl"
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
                className="text-zinc-500 hover:text-white"
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
                  className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-xl"
                  aria-label={e.label}
                  title={e.label}
                >
                  {e.char}
                </motion.button>
              ))}
            </div>
            {!hasParticipated && (
              <p className="mt-1 px-2 text-[9px] text-zinc-500 text-center leading-tight">
                Puja o compra para desbloquear
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom console — más compacto (antes pb-6, ahora pb-3 + panel menor) */}
      <div className="absolute bottom-0 inset-x-0 z-30">
        {/* Tab toggle — compacto */}
        <div className="px-3 pb-1.5">
          <div className="inline-flex p-0.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10">
            <button
              onClick={() => setMobileTab('bid')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                mobileTab === 'bid' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-300'
              }`}
            >
              <Gavel className="inline h-3 w-3 mr-1" />Puja
            </button>
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                mobileTab === 'chat' ? 'bg-purple-400 text-zinc-950' : 'text-zinc-300'
              }`}
            >
              <MessageCircle className="inline h-3 w-3 mr-1" />Chat
            </button>
          </div>
        </div>

        {/* Panel body — padding reducido */}
        <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-[2rem] p-3 pt-3 pb-4 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-2" />

          <AnimatePresence mode="wait">
            {mobileTab === 'bid' ? (
              <motion.div
                key="bid"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
              >
                {/* Leader price compact */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-amber-400">
                      <Crown className="inline h-2.5 w-2.5 mr-1" />Puja líder
                    </span>
                    <p className="text-xl font-black text-amber-400 font-mono tabular-nums leading-none mt-0.5">
                      {formatPEN(currentBid)}
                    </p>
                  </div>
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                </div>

                {/* Quick bid pills */}
                <div className="flex gap-2 mb-2">
                  {QUICK_BIDS.map((amt) => (
                    <BidPill key={amt} amount={amt} onBid={handleQuickBid} />
                  ))}
                </div>

                {/* Primary CTA — más compacto */}
                <PujarButton increment={auction.bidIncrement || 2} onBid={handleQuickBid} full />

                {/* Secondary CTA */}
                <div className="mt-2">
                  <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                </div>

                {/* Stock mini-info */}
                <p className="mt-2 text-[10px] text-zinc-500 leading-relaxed text-center">
                  Stock: <span className="font-bold text-lime-400">{product?.stock ?? 0} uds</span> · {bidCount} pujas · {formatViewers(viewers)}
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
                <div className="max-h-44 overflow-y-auto no-scrollbar space-y-1.5 mb-3">
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
        productId={product?.id ?? id}
        productName={product?.title ?? 'Subasta'}
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
          packageDescription: product?.title ?? 'Subasta',
          weightKg: 0.5,
          declaredValue: buyNowPrice,
        }}
      />
    </>
  )
}
