'use client'

import * as React from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Flame, Eye, Heart, Share2, ShoppingBag, ChevronLeft,
  MessageCircle, Send, Zap, Gavel, Clock, BadgeCheck, Loader2,
  ShieldCheck,
} from 'lucide-react'
import { MOCK_STREAMS, MOCK_AUCTION, MOCK_BIDS, MOCK_CHAT, MOCK_PROFILES, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'
import { formatViewers, formatPEN, timeAgoEs } from '@/lib/vendeda/format'
import { ROUTES } from '@/lib/vendeda/routes'
import CheckoutBottomSheet from '@/components/vendeda/CheckoutBottomSheet'

interface ChatMessage {
  id: string
  username: string
  text: string
  color: string
  isBot?: boolean
}

const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', username: 'María', text: '¿Tienes talla M en terracota?', color: 'text-amber-400' },
  { id: '2', username: 'YaBot AI', text: '¡Quedan 25 unidades en stock! 🤖', color: 'text-purple-400', isBot: true },
  { id: '3', username: 'Diego', text: 'S/. 38! 💪', color: 'text-sky-400' },
  { id: '4', username: 'Carla', text: 'Yape listoooo', color: 'text-lima-400' },
]

export default function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()

  const stream = MOCK_STREAMS.find((s) => s.id === id)
  const auction = MOCK_TRENDING_AUCTIONS.find((a) => a.streamId === id) ?? MOCK_AUCTION
  const seller = stream?.seller ?? MOCK_PROFILES[0]
  const product = auction.product

  const [currentBid, setCurrentBid] = React.useState(auction.currentPrice)
  const [bidCount, setBidCount] = React.useState(MOCK_BIDS.length)
  const [viewers] = React.useState(stream?.viewerCount ?? 248)
  const [likes, setLikes] = React.useState(stream?.likeCount ?? 1240)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [chat, setChat] = React.useState<ChatMessage[]>(INITIAL_CHAT)
  const [chatInput, setChatInput] = React.useState('')
  const [secondsLeft, setSecondsLeft] = React.useState(164) // 02:44
  const [liked, setLiked] = React.useState(false)

  // Countdown
  React.useEffect(() => {
    if (!stream?.isLive) return
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [stream?.isLive])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const lowTime = secondsLeft <= 30

  // Quick bid handler
  const handleQuickBid = (increment: number) => {
    setCurrentBid((prev) => +(prev + increment).toFixed(2))
    setBidCount((prev) => prev + 1)
  }

  // Send chat
  const sendChat = () => {
    if (!chatInput.trim()) return
    setChat((prev) => [
      ...prev,
      { id: Date.now().toString(), username: 'Tú', text: chatInput.trim(), color: 'text-emerald-400' },
    ])
    setChatInput('')
  }

  if (!stream) notFound()

  return (
    <div className="fixed inset-0 bg-black text-white select-none antialiased overflow-hidden md:relative md:max-w-md md:mx-auto md:h-screen md:rounded-none">
      {/* ────────────────────────────────────────────────────
          CAPA 1: VIDEO STREAM DE FONDO RELLENO (Estilo TikTok Live)
          ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {/* Simulated video placeholder — in prod this is replaced by AWS IVS / Cloudflare Stream player */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${stream.thumbnailUrl ?? product?.images?.[0] ?? ''})` }}
        />
        {/* Vignette + dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 2: HEADER FLOTANTE SUPERIOR (Confianza)
          ──────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Seller pill */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md pl-1.5 pr-3 py-1.5 rounded-full border border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center font-black text-slate-950 text-xs">
            {seller.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black tracking-tight flex items-center gap-1">
              {seller.displayName}
              {seller.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400" />}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> EN VIVO
            </span>
          </div>
        </div>

        {/* Viewers pill */}
        <div className="bg-rose-600/95 text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-full shadow-lg shadow-rose-600/30 backdrop-blur-sm flex items-center gap-1 uppercase">
          <Flame className="h-3 w-3" /> {viewers}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 3: CRONÓMETRO + INFO SUBASTA (Presión Psicológica)
          ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-24 left-4 z-20 flex gap-2 items-start"
      >
        <div
          className={`backdrop-blur-xl border px-3 py-2 rounded-2xl flex flex-col items-center min-w-[78px] shadow-2xl transition-colors ${
            lowTime
              ? 'bg-rose-950/80 border-rose-500/50'
              : 'bg-slate-950/80 border-amber-500/30'
          }`}
        >
          <span className={`text-[9px] font-bold tracking-widest uppercase ${lowTime ? 'text-rose-300' : 'text-amber-400'}`}>
            Cierra en
          </span>
          <span className={`text-base font-black font-mono tracking-tight ${lowTime ? 'text-rose-300' : 'text-white'} ${lowTime ? 'animate-pulse' : ''}`}>
            {mm}:{ss}
          </span>
        </div>

        {/* Bids count */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-2xl flex flex-col items-center min-w-[78px] shadow-xl">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Pujas</span>
          <span className="text-base font-black font-mono text-white">{bidCount}</span>
        </div>
      </motion.div>

      {/* ────────────────────────────────────────────────────
          CAPA 4: ACCIONES SOCIALES DERECHA (Like / Share)
          ──────────────────────────────────────────────────── */}
      <div className="absolute right-3 bottom-72 z-20 flex flex-col gap-4 items-center pointer-events-auto">
        <motion.button
          whileTap={{ scale: 1.4 }}
          onClick={() => {
            setLiked((v) => !v)
            setLikes((l) => (liked ? l - 1 : l + 1))
          }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Heart className={`h-6 w-6 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </div>
          <span className="text-[10px] font-bold">{formatViewers(likes)}</span>
        </motion.button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold">Compartir</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 5: CHAT TRASLÚCIDO (Fluida)
          ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-56 inset-x-0 px-3 z-20 pointer-events-none">
        <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar pointer-events-auto">
          <AnimatePresence initial={false}>
            {chat.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs p-2 rounded-xl backdrop-blur-sm border ${
                  msg.isBot
                    ? 'bg-purple-950/50 border-purple-500/20'
                    : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <span className={`font-bold ${msg.color}`}>{msg.username}:</span>{' '}
                <span className="text-slate-200">{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 6: CONSOLA TRANSACCIONAL COMPACTA
          ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800 rounded-t-[2rem] p-4 pt-5 pb-6 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        {/* Product active row */}
        <div className="flex gap-3 items-center mb-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
            {product?.images?.[0] ? (
              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                IMG
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate text-slate-200">{product?.title ?? 'Subasta en vivo'}</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {auction.buyNowPrice ? (
                <>
                  Compra ya: <b className="text-slate-300">{formatPEN(auction.buyNowPrice)}</b>
                </>
              ) : (
                'Puja creciente'
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-black block uppercase text-slate-500 tracking-wider">Puja líder</span>
            <span className="text-base font-black text-amber-400 font-mono">{formatPEN(currentBid)}</span>
          </div>
        </div>

        {/* Quick bid increments */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[2, 5, 10].map((inc) => (
            <button
              key={inc}
              onClick={() => handleQuickBid(inc)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-95 transition-all text-xs font-bold py-2.5 rounded-xl text-slate-300"
            >
              + {formatPEN(inc)}
            </button>
          ))}
        </div>

        {/* Master actions: Bid + Buy now */}
        <div className="grid grid-cols-12 gap-2.5">
          <button
            onClick={() => handleQuickBid(2)}
            className="col-span-7 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider py-4 rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-1.5"
          >
            <Gavel className="h-4 w-4" /> Pujar ahora
          </button>

          <button
            onClick={() => setShowCheckout(true)}
            className="col-span-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold py-4 rounded-2xl active:scale-[0.98] transition-all flex flex-col justify-center items-center gap-0.5"
          >
            <span className="text-[10px] text-slate-400 leading-none flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> Comprar ya
            </span>
            <span className="text-xs font-black text-white leading-none font-mono">
              {auction.buyNowPrice ? formatPEN(auction.buyNowPrice) : formatPEN(currentBid + 50)}
            </span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 7: CHAT INPUT FLOTANTE (cuando se enfoca)
          ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-[200px] inset-x-3 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-1 py-1">
          <MessageCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none py-2"
          />
          <button
            onClick={sendChat}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Enviar"
          >
            <Send className="h-3.5 w-3.5 text-slate-950" />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────
          CAPA 8: CHECKOUT BOTTOM SHEET (al comprar)
          ──────────────────────────────────────────────────── */}
      <CheckoutBottomSheet
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productId={product?.id ?? id}
        productName={product?.title ?? 'Subasta'}
        price={auction.buyNowPrice ?? currentBid}
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
          declaredValue: auction.buyNowPrice ?? currentBid,
        }}
      />
    </div>
  )
}
