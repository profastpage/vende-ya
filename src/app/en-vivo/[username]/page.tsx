import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import LiveRoomClient from './LiveRoomClient'
import OfflineChannelClient from './OfflineChannelClient'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'

export const dynamic = 'force-dynamic'

export default async function StreamDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { username } = await params
  const cleanParam = decodeURIComponent(username).replace(/^@/, '').replace('%40', '').trim()

  // 1. Try to find stream by ID or by seller username
  let stream: any = null
  try {
    stream = await db.liveStream.findFirst({
      where: {
        OR: [
          { id: cleanParam },
          { seller: { username: cleanParam } },
          { seller: { id: cleanParam } },
          { seller: { username: { equals: cleanParam, mode: 'insensitive' } } }
        ]
      },
      include: { seller: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (err) {
    console.error('[StreamDetailPage] Error fetching stream:', err)
  }

  // 2. Check if stream is currently live
  const isLive = stream && (stream.isLive === true || stream.status === 'live')

  if (isLive && stream) {
    // Fetch active auction for this stream
    const auction = await db.auction.findFirst({
      where: { streamId: stream.id, status: 'live' },
      include: { product: true }
    })

    const product = auction?.product || null
    const seller = stream.seller || MOCK_PROFILES[0]

    const initialChatMessages = await db.liveChatMessage.findMany({
      where: { 
        streamId: stream.id,
        isHidden: false,
        type: { not: 'streamer-ban' }
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { sender: true }
    })

    let isInitiallyBlocked = false
    if (user) {
      const banRecord = await db.liveChatMessage.findFirst({
        where: {
          streamId: stream.id,
          type: 'streamer-ban',
          senderId: user.id
        }
      })
      if (banRecord) isInitiallyBlocked = true
    }

    const initialChat = initialChatMessages.map(msg => ({
      id: msg.id,
      username: msg.sender?.displayName || msg.guestName || 'Usuario',
      avatarUrl: msg.sender?.avatarUrl || undefined,
      text: msg.content,
      color: msg.type === 'ai' ? 'text-purple-400' : 'text-white',
      isBot: msg.type === 'ai',
      senderId: msg.senderId || undefined
    }))

    return (
      <LiveRoomClient 
        currentUserId={user?.id}
        stream={stream} 
        auction={auction} 
        product={product} 
        seller={seller}
        initialChat={initialChat}
        isInitiallyBlocked={isInitiallyBlocked}
      />
    )
  }

  // 3. If stream is NOT live (or not found), find the seller profile for the OFFLINE experience
  let seller = stream?.seller || null
  if (!seller) {
    try {
      seller = await db.profile.findFirst({
        where: {
          OR: [
            { username: cleanParam },
            { id: cleanParam },
            { authId: cleanParam },
            { username: { equals: cleanParam, mode: 'insensitive' } }
          ]
        }
      })
    } catch (err) {
      console.error('[StreamDetailPage] Error fetching seller profile:', err)
    }
  }

  // If no seller could be found at all, return 404
  if (!seller) {
    notFound()
  }

  // 4. Fetch seller's active products
  let products: any[] = []
  try {
    products = await db.product.findMany({
      where: {
        sellerId: seller.id,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    })
  } catch (err) {
    console.error('[StreamDetailPage] Error fetching seller products:', err)
  }

  // 5. Fetch other live streams for recommendations
  let otherLiveStreams: any[] = []
  try {
    otherLiveStreams = await db.liveStream.findMany({
      where: {
        isLive: true,
        ...(stream ? { id: { not: stream.id } } : {})
      },
      include: { seller: true },
      orderBy: { viewerCount: 'desc' },
      take: 4
    })
  } catch (err) {
    console.error('[StreamDetailPage] Error fetching other live streams:', err)
  }

  return (
    <OfflineChannelClient
      seller={{
        id: seller.id,
        username: seller.username,
        displayName: seller.displayName || seller.username,
        avatarUrl: seller.avatarUrl,
        bio: seller.bio,
        department: seller.department,
        rating: seller.rating || 5.0,
        ratingsCount: seller.ratingsCount || 0,
        salesCount: seller.salesCount || 0,
        followerCount: seller.followerCount || 0,
        isVerified: Boolean(seller.isVerified)
      }}
      streamTitle={stream?.title}
      products={products}
      otherLiveStreams={otherLiveStreams}
    />
  )
}
