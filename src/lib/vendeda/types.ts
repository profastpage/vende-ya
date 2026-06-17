/**
 * VENDE YA — Shared TypeScript types
 * Mirrors Prisma models but kept loose for client/server boundary.
 */
export type ID = string

export type Locale = 'es-PE' | 'en-US'

export type Currency = 'PEN' | 'USD'

export type PaymentMethodId = 'yape' | 'plin' | 'pagoefectivo' | 'card' | 'transfer'

export type ProductStatus = 'draft' | 'active' | 'sold' | 'archived' | 'flagged'
export type ProductCondition = 'nuevo' | 'usado-como-nuevo' | 'usado-bueno' | 'usado-aceptable'
export type AuctionStatus = 'scheduled' | 'live' | 'sold' | 'canceled' | 'expired'
export type StreamStatus = 'scheduled' | 'live' | 'ended' | 'error'
export type PaymentStatus = 'pending' | 'verified' | 'disputed' | 'refunded' | 'failed'

export type ChatMessageType = 'user' | 'system' | 'ai' | 'pinned' | 'bid-event'

export type ModerationCategory =
  | 'clean'
  | 'profanity'
  | 'spam'
  | 'competitor-url'
  | 'toxic'
  | 'personal-info'

export interface Profile {
  id: ID
  username: string
  displayName: string
  avatarUrl?: string | null
  bio?: string | null
  rating: number
  ratingsCount: number
  salesCount: number
  isVerified: boolean
  isLiveSeller: boolean
  followerCount: number
  department?: string | null
  locale: Locale
}

export interface Category {
  id: ID
  slug: string
  nameEs: string
  nameEn?: string | null
  icon?: string | null
  color?: string | null
  productCount?: number
}

export interface Product {
  id: ID
  sellerId: ID
  seller?: Profile
  categoryId?: ID | null
  category?: Category | null
  title: string
  description: string
  basePrice: number
  currency: Currency
  condition: ProductCondition
  stock: number
  images: string[] // R2 keys or full URLs
  paymentMethods: PaymentMethodId[]
  shippingFrom?: string | null
  shipsNationwide: boolean
  shippingCost: number
  status: ProductStatus
  createdAt: string
}

export interface LiveStream {
  id: ID
  sellerId: ID
  seller?: Profile
  streamKey: string
  playbackId?: string | null
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  status: StreamStatus
  isLive: boolean
  viewerCount: number
  peakViewerCount: number
  likeCount: number
  shareCount: number
  aiModerationEnabled: boolean
  scheduledAt?: string | null
  startedAt?: string | null
  endedAt?: string | null
}

export interface Auction {
  id: ID
  streamId?: ID | null
  stream?: LiveStream | null
  sellerId: ID
  seller?: Profile
  productId: ID
  product?: Product
  startingPrice: number
  currentPrice: number
  reservePrice?: number | null
  buyNowPrice?: number | null
  bidIncrement: number
  status: AuctionStatus
  winnerId?: ID | null
  winner?: Profile | null
  startsAt: string
  endsAt?: string | null
  durationSec: number
  bidCount: number
  watcherCount: number
  currency: Currency
}

export interface Bid {
  id: ID
  auctionId: ID
  bidderId: ID
  bidder?: Pick<Profile, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  amount: number
  isWinning: boolean
  isAutoBid: boolean
  createdAt: string
  currency: Currency
}

export interface LiveChatMessage {
  id: ID
  streamId: ID
  senderId?: ID | null
  sender?: Pick<Profile, 'id' | 'username' | 'displayName' | 'avatarUrl'> | null
  guestName?: string | null
  content: string
  type: ChatMessageType
  aiFlagged: boolean
  aiCategory?: ModerationCategory | null
  aiScore?: number | null
  isHidden: boolean
  createdAt: string
}

export interface Notification {
  id: ID
  userId: ID
  type:
    | 'bid-outbid'
    | 'auction-won'
    | 'auction-sold'
    | 'new-follower'
    | 'live-started'
    | 'payment-verified'
    | 'chat-mention'
  title: string
  body?: string | null
  linkUrl?: string | null
  isRead: boolean
  createdAt: string
}

// =====================================================================
// SOCKET.IO REALTIME EVENTS — Vende Ya protocol
// =====================================================================
export type SocketEvent =
  // Client -> Server
  | 'auction:join'
  | 'auction:leave'
  | 'auction:bid'
  | 'auction:autobid'
  | 'stream:join'
  | 'stream:leave'
  | 'chat:send'
  | 'reaction:send'
  // Server -> Client
  | 'auction:state'
  | 'auction:bid:new'
  | 'auction:bid:outbid'
  | 'auction:ended'
  | 'chat:message'
  | 'chat:flagged'
  | 'reaction:new'
  | 'viewer:count'
  | 'stream:ended'

export interface BidPayload {
  id?: ID
  auctionId: ID
  bidderId: ID
  bidderName: string
  bidderAvatar?: string | null
  amount: number
  currency?: Currency
  isAutoBid: boolean
  timestamp: string
  // Server-included extras (for state sync)
  currentPrice?: number
  bidCount?: number
  endsAt?: number | null
}

export interface ChatPayload {
  id?: ID
  streamId: ID
  senderId: ID | null
  senderName: string
  senderAvatar?: string | null
  content: string
  type: ChatMessageType
  aiFlagged: boolean
  aiCategory?: ModerationCategory | null
  aiScore?: number | null
  timestamp: string
}

export interface ReactionPayload {
  id?: ID
  streamId: ID
  emoji: string
  userId?: ID | null
  color: string
}
