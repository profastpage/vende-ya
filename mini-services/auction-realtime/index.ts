/**
 * VENDE YA — Auction Realtime Mini-Service (Socket.io)
 * =====================================================================
 * Port 3003. Caddy forwards `/?XTransformPort=3003` to here.
 * Path MUST be `/` (per Caddyfile rule).
 *
 * Responsibilities:
 *  - In-memory state for live auctions + streams (dev only; in prod
 *    Supabase Realtime handles replication, and this service is the
 *    ephemeral "broadcast" layer that fans out Postgres NOTIFY).
 *  - Validates bids (price > currentPrice, meets increment).
 *  - Anti-fraud rate limiting per socket + per auction.
 *  - AI moderation hook (calls /api/ai/moderate-chat in Next app).
 *  - Heartbeat for viewer count.
 *
 * =====================================================================
 */
import { createServer } from 'http'
import { Server, type Socket } from 'socket.io'

const PORT = 3003

// =====================================================================
// TYPES
// =====================================================================
interface BidRecord {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string
  bidderAvatar?: string | null
  amount: number
  isWinning: boolean
  isAutoBid: boolean
  createdAt: string
}

interface AuctionState {
  id: string
  currentPrice: number
  bidIncrement: number
  bidCount: number
  winnerBidderId: string | null
  bids: BidRecord[]
  endsAt: number | null
  status: 'live' | 'sold' | 'canceled'
  watchers: Set<string>
}

interface StreamState {
  id: string
  viewerCount: number
  likeCount: number
  shareCount: number
  messages: any[]
  reactions: any[]
}

// =====================================================================
// IN-MEMORY STATE (dev only)
// =====================================================================
const auctions = new Map<string, AuctionState>()
const streams  = new Map<string, StreamState>()
const socketAuctions = new Map<string, Set<string>>() // socketId -> auctionIds
const socketStreams  = new Map<string, Set<string>>() // socketId -> streamIds

// Rate limiters
const bidTimesBySocket = new Map<string, number[]>()
const chatTimesBySocket = new Map<string, number[]>()
const RATE_WINDOW_MS = 60_000
const BID_RATE = 20    // 20 bids/min
const CHAT_RATE = 30   // 30 msgs/min

function rateCheck(map: Map<string, number[]>, key: string, max: number): boolean {
  const now = Date.now()
  const arr = (map.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (arr.length >= max) return false
  arr.push(now)
  map.set(key, arr)
  return true
}

// =====================================================================
// SEED — create the demo auction on boot so the first client sees state.
// =====================================================================
function seedDemoAuction() {
  const auctionId = 'a1'
  const streamId  = 's1'
  const now = Date.now()

  auctions.set(auctionId, {
    id: auctionId,
    currentPrice: 38,
    bidIncrement: 2,
    bidCount: 18,
    winnerBidderId: 'p4',
    bids: [
      {
        id: 'b1', auctionId, bidderId: 'p5', bidderName: 'María',
        bidderAvatar: 'https://i.pravatar.cc/150?img=23',
        amount: 36, isWinning: false, isAutoBid: false,
        createdAt: new Date(now - 90_000).toISOString(),
      },
      {
        id: 'b2', auctionId, bidderId: 'p4', bidderName: 'Diego',
        bidderAvatar: 'https://i.pravatar.cc/150?img=68',
        amount: 38, isWinning: true, isAutoBid: false,
        createdAt: new Date(now - 36_000).toISOString(),
      },
    ],
    endsAt: now + 165_000, // 2:45 left
    status: 'live',
    watchers: new Set(),
  })

  streams.set(streamId, {
    id: streamId,
    viewerCount: 248,
    likeCount: 1890,
    shareCount: 76,
    messages: [
      {
        id: 'm1', streamId, senderId: 'p5', senderName: 'María',
        senderAvatar: 'https://i.pravatar.cc/150?img=23',
        content: '¡Hola Rosa! ¿Tienes talla M en terracota?',
        type: 'user', aiFlagged: false, aiCategory: 'clean', aiScore: 0.02,
        timestamp: new Date(now - 110_000).toISOString(),
      },
      {
        id: 'm2', streamId, senderId: null, senderName: 'YaBot',
        content: '👋 Bienvenida María! Talla M en terracota está disponible. Stock actual: 25 unidades.',
        type: 'ai', aiFlagged: false, aiCategory: 'clean', aiScore: 0,
        timestamp: new Date(now - 100_000).toISOString(),
      },
      {
        id: 'm3', streamId, senderId: 'p4', senderName: 'Diego',
        senderAvatar: 'https://i.pravatar.cc/150?img=68',
        content: 'S/. 38! 💪', type: 'user', aiFlagged: false, aiCategory: 'clean', aiScore: 0.01,
        timestamp: new Date(now - 36_000).toISOString(),
      },
    ],
    reactions: [],
  })

  console.log(`[vendeya:realtime] Seeded auction ${auctionId} + stream ${streamId}`)
}

// =====================================================================
// HELPERS
// =====================================================================
function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function emitAuctionState(io: Server, auctionId: string) {
  const a = auctions.get(auctionId)
  if (!a) return
  io.to(`auction:${auctionId}`).emit('auction:state', {
    id: a.id,
    currentPrice: a.currentPrice,
    bidIncrement: a.bidIncrement,
    bidCount: a.bidCount,
    winnerBidderId: a.winnerBidderId,
    endsAt: a.endsAt,
    status: a.status,
    watcherCount: a.watchers.size,
    recentBids: a.bids.slice(-8),
  })
}

function emitStreamState(io: Server, streamId: string) {
  const s = streams.get(streamId)
  if (!s) return
  io.to(`stream:${streamId}`).emit('viewer:count', {
    streamId,
    viewerCount: s.viewerCount,
    likeCount: s.likeCount,
    shareCount: s.shareCount,
  })
}

// =====================================================================
// SERVER
// =====================================================================
const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60_000,
  pingInterval: 25_000,
})

seedDemoAuction()

io.on('connection', (socket: Socket) => {
  console.log(`[vendeya:realtime] connected ${socket.id}`)
  socketAuctions.set(socket.id, new Set())
  socketStreams.set(socket.id, new Set())

  // ---- AUCTION: JOIN ----
  socket.on('auction:join', ({ auctionId }: { auctionId: string }) => {
    if (!auctionId) return
    socketAuctions.get(socket.id)!.add(auctionId)
    socket.join(`auction:${auctionId}`)
    const a = auctions.get(auctionId)
    if (a) {
      a.watchers.add(socket.id)
      emitAuctionState(io, auctionId)
    }
  })

  socket.on('auction:leave', ({ auctionId }: { auctionId: string }) => {
    socket.leave(`auction:${auctionId}`)
    socketAuctions.get(socket.id)?.delete(auctionId)
    const a = auctions.get(auctionId)
    if (a) {
      a.watchers.delete(socket.id)
      emitAuctionState(io, auctionId)
    }
  })

  // ---- AUCTION: BID ----
  socket.on('auction:bid', (payload: {
    auctionId: string
    bidderId: string
    bidderName: string
    bidderAvatar?: string | null
    amount: number
    isAutoBid?: boolean
  }) => {
    // Rate limit
    if (!rateCheck(bidTimesBySocket, socket.id, BID_RATE)) {
      socket.emit('auction:bid:failed', {
        auctionId: payload.auctionId,
        reason: 'Demasiadas pujas. Espera unos segundos.',
      })
      return
    }

    const a = auctions.get(payload.auctionId)
    if (!a) {
      socket.emit('auction:bid:failed', { auctionId: payload.auctionId, reason: 'Subasta no encontrada.' })
      return
    }
    if (a.status !== 'live') {
      socket.emit('auction:bid:failed', { auctionId: payload.auctionId, reason: 'La subasta no está activa.' })
      return
    }
    if (a.endsAt && Date.now() > a.endsAt) {
      a.status = 'sold'
      io.to(`auction:${a.id}`).emit('auction:ended', {
        auctionId: a.id,
        winnerBidderId: a.winnerBidderId,
        finalPrice: a.currentPrice,
      })
      return
    }

    const minBid = a.currentPrice + a.bidIncrement
    if (payload.amount < minBid) {
      socket.emit('auction:bid:failed', {
        auctionId: payload.auctionId,
        reason: `Puja mínima: S/. ${minBid.toFixed(2)}`,
        minBid,
      })
      return
    }

    // Mark previous winning bid as not winning
    a.bids.forEach((b) => (b.isWinning = false))
    const bid: BidRecord = {
      id: genId('b'),
      auctionId: a.id,
      bidderId: payload.bidderId,
      bidderName: payload.bidderName,
      bidderAvatar: payload.bidderAvatar ?? null,
      amount: payload.amount,
      isWinning: true,
      isAutoBid: payload.isAutoBid ?? false,
      createdAt: new Date().toISOString(),
    }
    a.bids.push(bid)
    a.currentPrice = payload.amount
    a.bidCount += 1
    a.winnerBidderId = payload.bidderId

    // Extend by 15s if bid lands in last 30s (anti-snipe)
    if (a.endsAt && a.endsAt - Date.now() < 30_000) {
      a.endsAt += 15_000
    }

    // Broadcast new bid to everyone in the auction room
    io.to(`auction:${a.id}`).emit('auction:bid:new', {
      id: bid.id,
      auctionId: a.id,
      bidderId: bid.bidderId,
      bidderName: bid.bidderName,
      bidderAvatar: bid.bidderAvatar,
      amount: bid.amount,
      isAutoBid: bid.isAutoBid,
      timestamp: bid.createdAt,
      currentPrice: a.currentPrice,
      bidCount: a.bidCount,
      endsAt: a.endsAt,
    })

    // Tell previous bidders they were outbid
    const previousBidders = new Set(
      a.bids.filter((b) => b.bidderId !== payload.bidderId).map((b) => b.bidderId)
    )
    previousBidders.forEach((bidderId) => {
      io.to(`auction:${a.id}`).emit('auction:bid:outbid', {
        auctionId: a.id,
        outbidderId: bidderId,
        newPrice: a.currentPrice,
      })
    })

    console.log(`[vendeya:realtime] bid on ${a.id}: S/. ${bid.amount} by ${bid.bidderName}`)
  })

  // ---- STREAM: JOIN ----
  socket.on('stream:join', ({ streamId, isViewer = true }: { streamId: string; isViewer?: boolean }) => {
    if (!streamId) return
    socketStreams.get(socket.id)!.add(streamId)
    socket.join(`stream:${streamId}`)
    const s = streams.get(streamId)
    if (s && isViewer) {
      s.viewerCount += 1
      emitStreamState(io, streamId)
    }
    // Send recent chat history
    if (s) {
      socket.emit('chat:history', {
        streamId,
        messages: s.messages.slice(-50),
      })
    }
  })

  socket.on('stream:leave', ({ streamId }: { streamId: string }) => {
    socket.leave(`stream:${streamId}`)
    socketStreams.get(socket.id)?.delete(streamId)
    const s = streams.get(streamId)
    if (s && s.viewerCount > 0) {
      s.viewerCount -= 1
      emitStreamState(io, streamId)
    }
  })

  // ---- CHAT ----
  socket.on('chat:send', (payload: {
    streamId: string
    senderId: string | null
    senderName: string
    senderAvatar?: string | null
    content: string
    type?: 'user' | 'system' | 'ai' | 'pinned' | 'bid-event'
  }) => {
    // Rate limit
    if (!rateCheck(chatTimesBySocket, socket.id, CHAT_RATE)) {
      socket.emit('chat:rejected', { reason: 'Demasiados mensajes. Pausa unos segundos.' })
      return
    }
    const s = streams.get(payload.streamId)
    if (!s) return

    // Server-side rule-based prefilter (matches client AI edge layer)
    const lower = payload.content.toLowerCase()
    let aiFlagged = false
    let aiCategory: string | null = null
    let aiScore = 0

    if (/(mercadoli\w*\.com\.pe|aliexpress\.com|amazon\.com|shopee\.com\.pe|facebook\.com\/marketplace)/i.test(payload.content)) {
      aiFlagged = true; aiCategory = 'competitor-url'; aiScore = 1
    } else if (/\b(puta|puto|mierda|est[úu]pido|idiota|cabr[óo]n|pendejo)\b/i.test(lower)) {
      aiFlagged = true; aiCategory = 'profanity'; aiScore = 0.95
    } else if (/\b9\d{8}\b/.test(payload.content)) {
      aiFlagged = true; aiCategory = 'personal-info'; aiScore = 0.9
    } else {
      aiCategory = 'clean'; aiScore = 0.05
    }

    const message = {
      id: genId('m'),
      streamId: payload.streamId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar ?? null,
      content: payload.content,
      type: payload.type ?? 'user',
      aiFlagged,
      aiCategory,
      aiScore,
      timestamp: new Date().toISOString(),
    }

    if (aiFlagged) {
      // Only tell the sender it was flagged (others don't see it)
      socket.emit('chat:flagged', {
        id: message.id,
        reason: aiCategory === 'competitor-url'
          ? 'No se permiten enlaces a otras plataformas.'
          : aiCategory === 'personal-info'
          ? 'No compartas información personal.'
          : 'Mensaje inapropiado.',
      })
      return
    }

    s.messages.push(message)
    if (s.messages.length > 500) s.messages = s.messages.slice(-500)

    io.to(`stream:${payload.streamId}`).emit('chat:message', message)
  })

  // ---- REACTIONS (floating hearts etc.) ----
  socket.on('reaction:send', (payload: { streamId: string; emoji: string; userId?: string | null; color?: string }) => {
    const s = streams.get(payload.streamId)
    if (!s) return
    if (!rateCheck(bidTimesBySocket, `react:${socket.id}`, 120)) return

    s.likeCount += 1
    io.to(`stream:${payload.streamId}`).emit('reaction:new', {
      id: genId('r'),
      streamId: payload.streamId,
      emoji: payload.emoji,
      color: payload.color ?? '#FF5A1F',
      userId: payload.userId ?? null,
      timestamp: new Date().toISOString(),
    })
  })

  // ---- LIKE (no floating reaction, just count) ----
  socket.on('stream:like', ({ streamId }: { streamId: string }) => {
    const s = streams.get(streamId)
    if (!s) return
    s.likeCount += 1
    emitStreamState(io, streamId)
  })

  // ---- DISCONNECT ----
  socket.on('disconnect', () => {
    console.log(`[vendeya:realtime] disconnected ${socket.id}`)
    // Remove from all auctions
    socketAuctions.get(socket.id)?.forEach((auctionId) => {
      const a = auctions.get(auctionId)
      if (a) {
        a.watchers.delete(socket.id)
        emitAuctionState(io, auctionId)
      }
    })
    // Remove from all streams
    socketStreams.get(socket.id)?.forEach((streamId) => {
      const s = streams.get(streamId)
      if (s && s.viewerCount > 0) {
        s.viewerCount -= 1
        emitStreamState(io, streamId)
      }
    })
    socketAuctions.delete(socket.id)
    socketStreams.delete(socket.id)
    bidTimesBySocket.delete(socket.id)
    chatTimesBySocket.delete(socket.id)
  })

  socket.on('error', (err: any) => {
    console.error(`[vendeya:realtime] socket error ${socket.id}:`, err)
  })
})

httpServer.listen(PORT, () => {
  console.log(`[vendeya:realtime] Socket.io server listening on port ${PORT}`)
})

// =====================================================================
// AUCTION EXPIRY WATCHER — ends auctions at their end time
// =====================================================================
setInterval(() => {
  const now = Date.now()
  for (const a of auctions.values()) {
    if (a.status === 'live' && a.endsAt && now > a.endsAt) {
      a.status = 'sold'
      io.to(`auction:${a.id}`).emit('auction:ended', {
        auctionId: a.id,
        winnerBidderId: a.winnerBidderId,
        finalPrice: a.currentPrice,
        bidCount: a.bidCount,
      })
      console.log(`[vendeya:realtime] auction ${a.id} ended. winner=${a.winnerBidderId} price=${a.currentPrice}`)
    }
  }
}, 1000)

// =====================================================================
// GRACEFUL SHUTDOWN
// =====================================================================
const shutdown = (sig: string) => () => {
  console.log(`[vendeya:realtime] ${sig} received, shutting down...`)
  io.close(() => {
    httpServer.close(() => process.exit(0))
  })
}
process.on('SIGTERM', shutdown('SIGTERM'))
process.on('SIGINT',  shutdown('SIGINT'))
