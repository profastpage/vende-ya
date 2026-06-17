'use client'

/**
 * VENDE YA — LiveBiddingContainer
 * =====================================================================
 * The centerpiece of the MVP: a real-time live auction component that
 * combines (a) the low-latency Cloudflare Stream player, (b) an
 * overlay chat with AI moderation flags, (c) the live bidding console,
 * (d) countdown + bid history, (e) floating reactions.
 *
 * Mobile-first: video on top, bidding bottom-sheet, chat overlay
 * floating over the video. Desktop: 60/40 split with chat + bid
 * console on the right.
 *
 * Real-time via Socket.io mini-service on port 3003.
 * =====================================================================
 */
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Radio, Heart, Share2, Send, Gavel, ShoppingCart, Trophy, Eye,
  ChevronUp, ChevronDown, Info, Flag, Bot, Verified, Sparkles, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  Sheet, SheetContent, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Drawer, DrawerContent, DrawerTrigger,
} from '@/components/ui/drawer'
import { getSocket } from '@/lib/vendeda/socket'
import {
  formatPEN, formatCountdown, formatViewers, timeAgoEs, initials, nextBid, clamp,
} from '@/lib/vendeda/format'
import { t } from '@/lib/vendeda/i18n'
import { STREAM_CONFIG, PAYMENT_METHODS } from '@/lib/vendeda/constants'
import type {
  Auction, Bid, LiveChatMessage, Profile, ChatPayload, BidPayload, ReactionPayload,
} from '@/lib/vendeda/types'
import { cn } from '@/lib/utils'

// =====================================================================
// PROPS
// =====================================================================
export interface LiveBiddingContainerProps {
  auction: Auction
  /** Current user (or guest for the demo). */
  currentUser: Profile
  /** Stream player — falls back to a poster + simulated preview when no playbackId. */
  streamPlaybackId?: string | null
  streamPosterUrl?: string | null
  /** Optional pre-loaded chat + bids (server-side rendered). */
  initialChat?: LiveChatMessage[]
  initialBids?: Bid[]
  className?: string
}

// =====================================================================
// EMOJI REACTIONS — Peruvian flavor
// =====================================================================
const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😍', '🇵🇪', '💪', '🎉', '💰']
const REACTION_COLORS = ['#FF5A1F', '#84CC16', '#F59E0B', '#EC4899', '#EF4444', '#8B5CF6', '#10B981', '#0EA5E9']

// =====================================================================
// MAIN COMPONENT
// =====================================================================
export function LiveBiddingContainer({
  auction, currentUser, streamPlaybackId, streamPosterUrl,
  initialChat = [], initialBids = [], className,
}: LiveBiddingContainerProps) {
  // ---- Real-time state ----
  const [isConnected, setIsConnected] = React.useState(false)
  const [currentPrice, setCurrentPrice] = React.useState(auction.currentPrice)
  const [bidCount, setBidCount] = React.useState(auction.bidCount)
  const [bids, setBids] = React.useState<Bid[]>(initialBids)
  const [chat, setChat] = React.useState<LiveChatMessage[]>(initialChat)
  const [chatInput, setChatInput] = React.useState('')
  const [bidInput, setBidInput] = React.useState<string>(
    nextBid(auction.currentPrice, auction.bidIncrement).toFixed(2)
  )
  const [endsAt, setEndsAt] = React.useState<number | null>(
    auction.endsAt ? new Date(auction.endsAt).getTime() : null
  )
  const [watcherCount, setWatcherCount] = React.useState(auction.watcherCount)
  const [viewerCount, setViewerCount] = React.useState(auction.stream?.viewerCount ?? 0)
  const [likeCount, setLikeCount] = React.useState(auction.stream?.likeCount ?? 0)
  const [reactions, setReactions] = React.useState<{ id: string; emoji: string; color: string; x: number }[]>([])
  const [isWinning, setIsWinning] = React.useState(false)
  const [justBidFlash, setJustBidFlash] = React.useState(false)
  const [auctionEnded, setAuctionEnded] = React.useState(false)
  const [placingBid, setPlacingBid] = React.useState(false)
  const [bidError, setBidError] = React.useState<string | null>(null)
  const [showBidHistory, setShowBidHistory] = React.useState(false)

  const socketRef = React.useRef<ReturnType<typeof getSocket> | null>(null)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // =====================================================================
  // SOCKET WIRING
  // =====================================================================
  React.useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    const onConnectError = (err: Error) => {
      // Silent — UI gracefully falls back to demo mode
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[VendeYa] socket connect_error (falling back to demo mode):', err.message)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    // Join auction + stream rooms
    socket.emit('auction:join', { auctionId: auction.id })
    if (auction.streamId) {
      socket.emit('stream:join', { streamId: auction.streamId })
    }

    // ---- Auction state (full snapshot) ----
    socket.on('auction:state', (s: any) => {
      setCurrentPrice(s.currentPrice)
      setBidCount(s.bidCount)
      if (s.endsAt) setEndsAt(s.endsAt)
      setWatcherCount(s.watcherCount)
      if (Array.isArray(s.recentBids)) {
        setBids(prev => [...prev, ...s.recentBids.filter((rb: Bid) => !prev.some(p => p.id === rb.id))])
      }
    })

    // ---- New bid ----
    socket.on('auction:bid:new', (p: BidPayload) => {
      setCurrentPrice(p.amount)
      setBidCount((c) => c + 1)
      if (p.endsAt) setEndsAt(p.endsAt)
      setIsWinning(p.bidderId === currentUser.id)
      setJustBidFlash(true)
      setTimeout(() => setJustBidFlash(false), 700)

      const newBid: Bid = {
        id: p.id ?? Math.random().toString(36).slice(2),
        auctionId: p.auctionId,
        bidderId: p.bidderId,
        bidder: {
          id: p.bidderId,
          username: p.bidderName.toLowerCase().replace(/\s+/g, '.'),
          displayName: p.bidderName,
          avatarUrl: p.bidderAvatar ?? null,
        },
        amount: p.amount,
        isWinning: true,
        isAutoBid: p.isAutoBid,
        createdAt: p.timestamp,
        currency: 'PEN',
      }
      setBids((prev) => {
        const updated = prev.map((b) => ({ ...b, isWinning: false }))
        return [...updated, newBid].slice(-50)
      })

      // Update suggested next bid
      setBidInput(nextBid(p.amount, auction.bidIncrement).toFixed(2))

      // Bid event in chat
      if (auction.streamId) {
        setChat((prev) => [
          ...prev,
          {
            id: `bid-${p.id}`,
            streamId: auction.streamId!,
            senderId: p.bidderId,
            sender: {
              id: p.bidderId,
              username: p.bidderName.toLowerCase().replace(/\s+/g, '.'),
              displayName: p.bidderName,
              avatarUrl: p.bidderAvatar ?? null,
            },
            content: `💰 Puja de ${formatPEN(p.amount)} por ${p.bidderName}`,
            type: 'bid-event',
            aiFlagged: false,
            aiCategory: 'clean',
            aiScore: 0,
            isHidden: false,
            createdAt: p.timestamp,
          },
        ])
      }
    })

    // ---- Outbid ----
    socket.on('auction:bid:outbid', (p: { auctionId: string; outbidderId: string; newPrice: number }) => {
      if (p.outbidderId === currentUser.id) {
        toast({
          title: '😅 Te superaron',
          description: `Nueva puja: ${formatPEN(p.newPrice)}. ¿Volvemos a pujar?`,
        })
      }
    })

    // ---- Bid failed ----
    socket.on('auction:bid:failed', (p: { auctionId: string; reason: string; minBid?: number }) => {
      setBidError(p.reason)
      setTimeout(() => setBidError(null), 3000)
      if (p.minBid) {
        setBidInput(p.minBid.toFixed(2))
      }
    })

    // ---- Auction ended ----
    socket.on('auction:ended', (p: { auctionId: string; winnerBidderId: string | null; finalPrice: number }) => {
      setAuctionEnded(true)
      setEndsAt(null)
      if (p.winnerBidderId === currentUser.id) {
        toast({
          title: '🎉 ¡Ganaste la subasta!',
          description: `Pagaste ${formatPEN(p.finalPrice)}. Te contactaremos por WhatsApp.`,
        })
      } else {
        toast({
          title: '🏁 Subasta finalizada',
          description: `Precio final: ${formatPEN(p.finalPrice)}`,
        })
      }
    })

    // ---- Chat ----
    socket.on('chat:message', (m: ChatPayload) => {
      setChat((prev) => [...prev, {
        id: m.id ?? Math.random().toString(36).slice(2),
        streamId: m.streamId,
        senderId: m.senderId,
        sender: m.senderId ? {
          id: m.senderId,
          username: m.senderName.toLowerCase().replace(/\s+/g, '.'),
          displayName: m.senderName,
          avatarUrl: m.senderAvatar ?? null,
        } : null,
        guestName: m.senderId ? null : m.senderName,
        content: m.content,
        type: m.type,
        aiFlagged: m.aiFlagged,
        aiCategory: m.aiCategory,
        aiScore: m.aiScore,
        isHidden: false,
        createdAt: m.timestamp,
      }].slice(-200))
    })

    socket.on('chat:history', (p: { streamId: string; messages: ChatPayload[] }) => {
      if (p.streamId !== auction.streamId) return
      setChat(p.messages.map((m) => ({
        id: m.id ?? Math.random().toString(36).slice(2),
        streamId: m.streamId,
        senderId: m.senderId,
        sender: m.senderId ? {
          id: m.senderId,
          username: m.senderName.toLowerCase().replace(/\s+/g, '.'),
          displayName: m.senderName,
          avatarUrl: m.senderAvatar ?? null,
        } : null,
        guestName: m.senderId ? null : m.senderName,
        content: m.content,
        type: m.type,
        aiFlagged: m.aiFlagged,
        aiCategory: m.aiCategory,
        aiScore: m.aiScore,
        isHidden: false,
        createdAt: m.timestamp,
      })))
    })

    socket.on('chat:flagged', (p: { id: string; reason: string }) => {
      toast({ title: '⚠️ Mensaje oculto', description: p.reason, variant: 'destructive' })
    })

    socket.on('chat:rejected', (p: { reason: string }) => {
      toast({ title: 'Mensajes demasiado rápido', description: p.reason, variant: 'destructive' })
    })

    // ---- Reactions ----
    socket.on('reaction:new', (r: ReactionPayload) => {
      const x = 20 + Math.random() * 60 // %
      const id = r.id ?? Math.random().toString(36).slice(2)
      setReactions((prev) => [...prev, { id, emoji: r.emoji, color: r.color, x }])
      setTimeout(() => {
        setReactions((prev) => prev.filter((p) => p.id !== id))
      }, 2500)
    })

    // ---- Viewer count heartbeat ----
    socket.on('viewer:count', (p: { streamId: string; viewerCount: number; likeCount: number; shareCount: number }) => {
      if (p.streamId === auction.streamId) {
        setViewerCount(p.viewerCount)
        setLikeCount(p.likeCount)
      }
    })

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.emit('auction:leave', { auctionId: auction.id })
      if (auction.streamId) socket.emit('stream:leave', { streamId: auction.streamId })
    }
     
  }, [auction.id, auction.streamId, currentUser.id])

  // =====================================================================
  // COUNTDOWN
  // =====================================================================
  const [secondsLeft, setSecondsLeft] = React.useState(
    endsAt ? Math.max(0, Math.floor((endsAt - Date.now()) / 1000)) : 0
  )
  React.useEffect(() => {
    if (!endsAt) return
    const i = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)))
    }, 500)
    return () => clearInterval(i)
  }, [endsAt])

  // Auto-scroll chat to bottom on new messages
  React.useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat.length])

  // =====================================================================
  // ACTIONS
  // =====================================================================
  const placeBid = React.useCallback((amount: number, isAuto = false) => {
    if (placingBid || auctionEnded) return
    setPlacingBid(true)
    setBidError(null)

    const applyBidLocally = (bidderId: string, bidderName: string, bidderAvatar?: string | null) => {
      // Mark previous winning bids as not winning
      const newBid: Bid = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        auctionId: auction.id,
        bidderId,
        bidder: {
          id: bidderId,
          username: bidderName.toLowerCase().replace(/\s+/g, '.'),
          displayName: bidderName,
          avatarUrl: bidderAvatar ?? null,
        },
        amount,
        isWinning: true,
        isAutoBid: isAuto,
        createdAt: new Date().toISOString(),
        currency: 'PEN',
      }
      setBids((prev) => {
        const updated = prev.map((b) => ({ ...b, isWinning: false }))
        return [...updated, newBid].slice(-50)
      })
      setCurrentPrice(amount)
      setBidCount((c) => c + 1)
      setIsWinning(bidderId === currentUser.id)
      setJustBidFlash(true)
      setTimeout(() => setJustBidFlash(false), 700)
      setBidInput(nextBid(amount, auction.bidIncrement).toFixed(2))

      // Anti-snipe: extend by 15s if bid lands in last 30s
      if (endsAt) {
        const msLeft = endsAt - Date.now()
        if (msLeft < 30_000) {
          setEndsAt(endsAt + 15_000)
        }
      }

      // Bid event in chat
      if (auction.streamId) {
        setChat((prev) => [
          ...prev,
          {
            id: `bid-${newBid.id}`,
            streamId: auction.streamId!,
            senderId: bidderId,
            sender: newBid.bidder!,
            content: `💰 Puja de ${formatPEN(amount)} por ${bidderName}`,
            type: 'bid-event',
            aiFlagged: false,
            aiCategory: 'clean',
            aiScore: 0,
            isHidden: false,
            createdAt: newBid.createdAt,
          },
        ])
      }
    }

    // If socket is connected, send through socket (server validates + broadcasts)
    if (socketRef.current?.connected) {
      socketRef.current.emit('auction:bid', {
        auctionId: auction.id,
        bidderId: currentUser.id,
        bidderName: currentUser.displayName,
        bidderAvatar: currentUser.avatarUrl,
        amount,
        isAutoBid: isAuto,
      })
    } else {
      // Demo mode: apply locally
      applyBidLocally(currentUser.id, currentUser.displayName, currentUser.avatarUrl)
      toast({
        title: '✅ Puja realizada (demo)',
        description: `Pujaste ${formatPEN(amount)}. En producción esto se transmite en vivo.`,
      })
    }

    // Optimistic UI lock to prevent double-bid
    setTimeout(() => setPlacingBid(false), STREAM_CONFIG.bidLockMs)
  }, [auction.id, auction.streamId, auction.bidIncrement, currentUser, placingBid, auctionEnded, endsAt, toast])

  const bumpBid = (delta: number) => {
    const v = parseFloat(bidInput) || currentPrice
    const next = clamp(
      Math.round((v + delta) * 100) / 100,
      currentPrice + auction.bidIncrement,
      999999
    )
    setBidInput(next.toFixed(2))
  }

  const sendChat = () => {
    const content = chatInput.trim()
    if (!content || !auction.streamId) return

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:send', {
        streamId: auction.streamId,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderAvatar: currentUser.avatarUrl,
        content,
        type: 'user',
      })
    } else {
      // Demo mode: append locally
      setChat((prev) => [
        ...prev,
        {
          id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          streamId: auction.streamId!,
          senderId: currentUser.id,
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl ?? null,
          },
          guestName: null,
          content,
          type: 'user' as const,
          aiFlagged: false,
          aiCategory: 'clean' as const,
          aiScore: 0.05,
          isHidden: false,
          createdAt: new Date().toISOString(),
        },
      ])
    }
    setChatInput('')
  }

  const sendReaction = (emoji: string, color: string) => {
    if (!auction.streamId) return
    if (socketRef.current?.connected) {
      socketRef.current.emit('reaction:send', {
        streamId: auction.streamId,
        emoji, color, userId: currentUser.id,
      })
    } else {
      // Demo mode: float locally
      const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const x = 20 + Math.random() * 60
      setReactions((prev) => [...prev, { id, emoji, color, x }])
      setTimeout(() => {
        setReactions((prev) => prev.filter((p) => p.id !== id))
      }, 2500)
      setLikeCount((c) => c + 1)
    }
  }

  const isReserveMet = auction.reservePrice != null ? currentPrice >= auction.reservePrice : true
  const minNext = nextBid(currentPrice, auction.bidIncrement)
  const winningBid = bids.find((b) => b.isWinning)

  // =====================================================================
  // STREAM PLAYER
  // =====================================================================
  const StreamPlayer = (
    <StreamPlayerView
      playbackId={streamPlaybackId}
      posterUrl={streamPosterUrl}
      title={auction.product?.title}
      isLive={!auctionEnded}
    />
  )

  // =====================================================================
  // STREAM OVERLAYS — Live badge, viewers, reactions
  // =====================================================================
  const StreamOverlays = (
    <>
      {/* Top-left: LIVE + viewers */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full glass px-2.5 py-1.5">
          <span className="live-dot" />
          <span className="text-xs font-bold text-white tracking-wide">
            {auctionEnded ? 'FINALIZADO' : t('stream.live')}
          </span>
        </div>
        <div className="hidden xs:flex items-center gap-1.5 rounded-full glass px-2.5 py-1.5">
          <Eye className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">{formatViewers(viewerCount).replace(' espectadores', '').replace('Sin espectadores', '0')}</span>
        </div>
      </div>

      {/* Top-right: product price ticker */}
      <div className="absolute top-3 right-3 z-20">
        <div className="glass rounded-xl px-3 py-2 flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-white/70 leading-none">Puja actual</span>
          <span className={cn(
            'text-lg font-bold text-white leading-tight transition-transform',
            justBidFlash && 'animate-bid-bounce'
          )}>
            {formatPEN(currentPrice)}
          </span>
        </div>
      </div>

      {/* Bottom-left: seller chip */}
      {auction.seller && (
        <div className="absolute bottom-3 left-3 z-20">
          <div className="flex items-center gap-2 glass rounded-full pl-1.5 pr-3 py-1.5">
            <Avatar className="h-7 w-7 border-2 border-white/30">
              <AvatarImage src={auction.seller.avatarUrl ?? undefined} alt={auction.seller.displayName} />
              <AvatarFallback className="text-xs">{initials(auction.seller.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white">{auction.seller.displayName}</span>
                {auction.seller.isVerified && <Verified className="h-3 w-3 text-salsa-400" />}
              </div>
              <span className="text-[10px] text-white/70">@{auction.seller.username}</span>
            </div>
          </div>
        </div>
      )}

      {/* Right-edge: quick reactions (vertical) */}
      <div className="absolute right-3 bottom-24 md:bottom-6 z-20 flex flex-col gap-2">
        {REACTION_EMOJIS.slice(0, 4).map((emoji, i) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji, REACTION_COLORS[i])}
            className="h-10 w-10 rounded-full glass flex items-center justify-center text-lg active:scale-90 transition-transform"
            aria-label={`Reaccionar con ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Floating reactions */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -180, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: 'easeOut' }}
              className="absolute bottom-24 text-3xl drop-shadow-lg"
              style={{ left: `${r.x}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )

  // =====================================================================
  // BID CONSOLE
  // =====================================================================
  const BidConsole = (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gavel className="h-4 w-4 text-salsa-500" />
          <span className="text-sm font-semibold">
            {auctionEnded
              ? t('auction.ended')
              : isWinning
              ? '👑 Eres el líder'
              : 'Puja para liderar'}
          </span>
        </div>
        {!auctionEnded && endsAt && (
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-sm font-bold tabular-nums',
            secondsLeft < 30 ? 'bg-salsa-100 text-salsa-700 animate-pulse' : 'bg-muted text-foreground'
          )}>
            <span className="text-[10px] uppercase opacity-70">{t('auction.endsIn')}</span>
            <span>{formatCountdown(secondsLeft)}</span>
          </div>
        )}
      </div>

      {/* Current price */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {t('auction.currentBid')}
          </div>
          <div className="text-3xl font-bold font-display tabular-nums text-foreground">
            {formatPEN(currentPrice)}
          </div>
          {winningBid && (
            <div className="text-xs text-muted-foreground mt-0.5">
              por <span className="font-medium text-foreground">{winningBid.bidder?.displayName}</span>{' '}
              · {t('auction.bidders')}: {bidCount}
            </div>
          )}
        </div>
        {!isReserveMet && (
          <Badge variant="outline" className="border-salsa-300 text-salsa-700 bg-salsa-50">
            <Info className="h-3 w-3 mr-1" /> Reserva no alcanzada
          </Badge>
        )}
      </div>

      {/* Bid input */}
      {!auctionEnded && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => bumpBid(-auction.bidIncrement)}
              disabled={placingBid}
              className="h-12 w-12 shrink-0"
              aria-label="Bajar puja"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">S/.</span>
              <Input
                type="number"
                inputMode="decimal"
                step={auction.bidIncrement}
                min={minNext}
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                disabled={placingBid}
                className="pl-10 h-12 text-lg font-bold tabular-nums"
                aria-label="Tu puja"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => bumpBid(auction.bidIncrement)}
              disabled={placingBid}
              className="h-12 w-12 shrink-0"
              aria-label="Subir puja"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick bid chips */}
          <div className="flex flex-wrap gap-1.5">
            {[minNext, minNext + auction.bidIncrement * 2, minNext + auction.bidIncrement * 5].map((amt) => (
              <button
                key={amt}
                onClick={() => setBidInput(amt.toFixed(2))}
                disabled={placingBid}
                className="text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-salsa-50 hover:text-salsa-700 transition-colors font-medium"
              >
                S/. {amt.toFixed(2)}
              </button>
            ))}
            {auction.buyNowPrice && (
              <button
                onClick={() => setBidInput(auction.buyNowPrice!.toFixed(2))}
                disabled={placingBid}
                className="text-xs px-2.5 py-1.5 rounded-md bg-lima-100 hover:bg-lima-200 text-lima-800 font-medium"
              >
                Comprar ya: S/. {auction.buyNowPrice.toFixed(2)}
              </button>
            )}
          </div>

          {/* Place bid */}
          <Button
            onClick={() => placeBid(parseFloat(bidInput))}
            disabled={placingBid || parseFloat(bidInput) < minNext}
            className="w-full h-12 text-base font-bold bg-salsa-500 hover:bg-salsa-600 text-white shadow-glow-salsa"
            size="lg"
          >
            {placingBid ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Procesando...
              </span>
            ) : (
              <>
                <Gavel className="h-5 w-5 mr-2" /> {t('auction.bidNow')} · S/. {bidInput}
              </>
            )}
          </Button>

          {/* Buy now */}
          {auction.buyNowPrice && !auctionEnded && (
            <Button
              variant="outline"
              onClick={() => placeBid(auction.buyNowPrice!)}
              disabled={placingBid}
              className="w-full h-11 border-lima-400 text-lima-700 hover:bg-lima-50"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('auction.buyNow')} · {formatPEN(auction.buyNowPrice)}
            </Button>
          )}

          {bidError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <Flag className="h-3 w-3" /> {bidError}
            </p>
          )}
          {!isConnected && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Modo demo · la puja se aplica localmente</span>
            </p>
          )}
        </div>
      )}

      {/* Auction ended state */}
      {auctionEnded && (
        <div className="rounded-xl border border-lima-300 bg-lima-50 p-4 text-center">
          <Trophy className="h-8 w-8 mx-auto text-lima-600 mb-2" />
          <p className="font-semibold text-lima-900">
            {isWinning ? '🎉 ¡Ganaste la subasta!' : '🏁 Subasta finalizada'}
          </p>
          <p className="text-sm text-lima-700 mt-1">
            Precio final: <span className="font-bold">{formatPEN(currentPrice)}</span>
          </p>
          {isWinning && (
            <Button className="mt-3 w-full bg-lima-500 hover:bg-lima-600 text-white">
              Pagar con Yape · S/. {currentPrice.toFixed(2)}
            </Button>
          )}
        </div>
      )}

      {/* Bid history */}
      <div className="pt-2">
        <button
          onClick={() => setShowBidHistory((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronUp className={cn('h-3 w-3 transition-transform', showBidHistory && 'rotate-180')} />
          {t('auction.bidHistory')} ({bids.length})
        </button>
        <AnimatePresence>
          {showBidHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ScrollArea className="h-40 mt-2 rounded-md border p-2">
                {bids.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Aún no hay pujas. ¡Sé el primero!
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {[...bids].reverse().map((b, i) => (
                      <div
                        key={b.id}
                        className={cn(
                          'flex items-center justify-between text-xs px-2 py-1.5 rounded-md',
                          b.isWinning ? 'bg-salsa-50 border border-salsa-200' : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground font-mono w-6">#{bids.length - i}</span>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={b.bidder?.avatarUrl ?? undefined} alt={b.bidder?.displayName} />
                            <AvatarFallback className="text-[10px]">{initials(b.bidder?.displayName ?? '?')}</AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">{b.bidder?.displayName}</span>
                          {b.isAutoBid && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">AUTO</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold tabular-nums">{formatPEN(b.amount)}</span>
                          {b.isWinning && <Trophy className="h-3 w-3 text-salsa-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  // =====================================================================
  // CHAT PANEL
  // =====================================================================
  const ChatPanel = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-lima-500" />
            <span className="text-xs font-semibold">Chat en vivo</span>
          </div>
          <span className="text-[10px] text-muted-foreground">· AI moderado</span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          <Eye className="h-2.5 w-2.5 mr-1" />
          {watcherCount} {t('auction.watchers')}
        </Badge>
      </div>
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto chat-scroll px-3 py-2 space-y-2 min-h-0"
      >
        {chat.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Sé el primero en escribir 💬
          </p>
        ) : (
          chat.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
      </div>
      <div className="p-2 border-t flex items-center gap-1.5 bg-card">
        <Input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChat()}
          placeholder={t('chat.placeholder')}
          maxLength={280}
          className="h-10 text-sm"
        />
        <Button
          onClick={sendChat}
          disabled={!chatInput.trim()}
          size="icon"
          className="h-10 w-10 bg-salsa-500 hover:bg-salsa-600 shrink-0"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // =====================================================================
  // PRODUCT SUMMARY
  // =====================================================================
  const ProductSummary = auction.product && (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
        {auction.product.images[0] ? (
           
          <img
            src={auction.product.images[0]}
            alt={auction.product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight line-clamp-2">
          {auction.product.title}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {auction.product.condition === 'nuevo' ? 'Nuevo' : auction.product.condition}
          {' · '}
          Stock: {auction.product.stock} u.
        </div>
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {auction.product.paymentMethods.slice(0, 3).map((pm) => (
            <Badge
              key={pm}
              variant="secondary"
              className="text-[9px] px-1.5 py-0"
              style={{
                backgroundColor: `${PAYMENT_METHODS[pm]?.color}20`,
                color: PAYMENT_METHODS[pm]?.color,
                borderColor: `${PAYMENT_METHODS[pm]?.color}40`,
              }}
            >
              {PAYMENT_METHODS[pm]?.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  // =====================================================================
  // LAYOUT — MOBILE
  // =====================================================================
  return (
    <div className={cn('w-full', className)}>
      {/* MOBILE LAYOUT */}
      <div className="md:hidden space-y-3">
        {/* Stream + overlays */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-tambo">
          {StreamPlayer}
          {StreamOverlays}

          {/* Bottom: chat overlay (transparent, floating) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 h-[35%] pointer-events-none">
            <div className="h-full overflow-y-auto chat-scroll px-3 py-2 space-y-1.5 [mask-image:linear-gradient(to_bottom,transparent,black_25%)]">
              {chat.slice(-8).map((m) => (
                <ChatBubble key={m.id} message={m} overlay />
              ))}
            </div>
          </div>
        </div>

        {/* Product */}
        {ProductSummary}

        {/* Bid console */}
        <div className="rounded-2xl border bg-card p-4 shadow-soft">
          {BidConsole}
        </div>

        {/* Chat (full, below) */}
        <div className="rounded-2xl border bg-card overflow-hidden h-80 shadow-soft">
          {ChatPanel}
        </div>
      </div>

      {/* DESKTOP LAYOUT — 60/40 split */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 lg:gap-6">
        {/* Left 60% — Stream */}
        <div className="md:col-span-3 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-tambo shadow-lift">
            {StreamPlayer}
            {StreamOverlays}
          </div>

          {/* Product summary */}
          {ProductSummary}

          {/* Bid history full */}
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Gavel className="h-4 w-4 text-salsa-500" />
              {t('auction.bidHistory')}
              <Badge variant="secondary" className="ml-auto text-xs">{bids.length}</Badge>
            </h3>
            <ScrollArea className="h-44">
              {bids.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Aún no hay pujas.
                </p>
              ) : (
                <div className="space-y-1.5 pr-2">
                  {[...bids].reverse().map((b, i) => (
                    <div
                      key={b.id}
                      className={cn(
                        'flex items-center justify-between text-sm px-3 py-2 rounded-md',
                        b.isWinning ? 'bg-salsa-50 border border-salsa-200' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-muted-foreground font-mono w-7 text-xs">#{bids.length - i}</span>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={b.bidder?.avatarUrl ?? undefined} alt={b.bidder?.displayName} />
                          <AvatarFallback className="text-[10px]">{initials(b.bidder?.displayName ?? '?')}</AvatarFallback>
                        </Avatar>
                        <span className="truncate font-medium text-sm">{b.bidder?.displayName}</span>
                        {b.isAutoBid && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">AUTO</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold tabular-nums">{formatPEN(b.amount)}</span>
                        {b.isWinning && <Trophy className="h-3.5 w-3.5 text-salsa-500" />}
                        <span className="text-[10px] text-muted-foreground">{timeAgoEs(b.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Right 40% — Chat + Bid Console */}
        <div className="md:col-span-2 space-y-4 flex flex-col">
          {/* Bid console (top of right pane) */}
          <div className="rounded-2xl border bg-card p-4 shadow-soft">
            {BidConsole}
          </div>

          {/* Chat (fills remaining) */}
          <div className="rounded-2xl border bg-card overflow-hidden shadow-soft flex-1 min-h-[400px]">
            {ChatPanel}
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================================
// STREAM PLAYER VIEW
// =====================================================================
function StreamPlayerView({
  playbackId, posterUrl, title, isLive,
}: {
  playbackId?: string | null
  posterUrl?: string | null
  title?: string
  isLive?: boolean
}) {
  // In production, this would render the Cloudflare <Stream /> player
  // using the playbackId. For the MVP demo we render a poster + a
  // simulated "live" preview that pulses to suggest motion.
  return (
    <div className="absolute inset-0">
      {playbackId ? (
         
        <img
          src={posterUrl ?? `https://customer-fake.cloudflarestream.com/${playbackId}/thumbnails/thumbnail.jpg`}
          alt={title ?? 'Live stream'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : posterUrl ? (
         
        <img
          src={posterUrl}
          alt={title ?? 'Live stream'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-salsa-900 via-tambo to-lima-900" />
      )}

      {/* Animated "live" sheen to suggest video motion */}
      {isLive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent animate-shimmer" />
        </div>
      )}

      {/* Subtle dark vignette for overlay legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
    </div>
  )
}

// =====================================================================
// CHAT BUBBLE
// =====================================================================
function ChatBubble({
  message, overlay = false,
}: {
  message: LiveChatMessage
  overlay?: boolean
}) {
  const sender = message.sender
  const displayName = sender?.displayName ?? message.guestName ?? 'Anónimo'
  const avatarUrl = sender?.avatarUrl ?? null

  // Bid event: special style
  if (message.type === 'bid-event') {
    return (
      <div className={cn(
        'flex items-center gap-1.5 text-xs px-2 py-1 rounded-md',
        overlay ? 'glass text-white' : 'bg-salsa-50 text-salsa-800'
      )}>
        <Gavel className="h-3 w-3 shrink-0" />
        <span className="font-medium">{message.content}</span>
      </div>
    )
  }

  // System / AI message
  if (message.type === 'ai' || message.type === 'system') {
    return (
      <div className={cn(
        'flex items-start gap-2 text-xs px-2 py-1.5 rounded-md',
        overlay ? 'glass text-white' : 'bg-lima-50 text-lima-900 border border-lima-200'
      )}>
        <div className="h-5 w-5 rounded-full bg-lima-500 flex items-center justify-center shrink-0">
          <Bot className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">YaBot</span>
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">AI</Badge>
          </div>
          <p className="leading-snug">{message.content}</p>
        </div>
      </div>
    )
  }

  // User message
  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback className="text-[10px]">{initials(displayName)}</AvatarFallback>
      </Avatar>
      <div className={cn('flex-1 min-w-0', overlay && 'glass rounded-md px-2 py-1')}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            'text-[11px] font-semibold',
            overlay ? 'text-white' : 'text-foreground'
          )}>
            {displayName}
          </span>
          {message.type === 'pinned' && (
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">
              {t('chat.pinned')}
            </Badge>
          )}
          <span className={cn(
            'text-[9px]',
            overlay ? 'text-white/60' : 'text-muted-foreground'
          )}>
            {timeAgoEs(message.createdAt)}
          </span>
        </div>
        <p className={cn(
          'text-xs leading-snug break-words',
          overlay ? 'text-white/95' : 'text-foreground'
        )}>
          {message.content}
        </p>
        {message.aiFlagged && (
          <p className="text-[9px] text-destructive flex items-center gap-1 mt-0.5">
            <Flag className="h-2.5 w-2.5" /> {message.aiCategory}
          </p>
        )}
      </div>
    </div>
  )
}
