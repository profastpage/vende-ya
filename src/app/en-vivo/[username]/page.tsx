import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import LiveRoomClient from './LiveRoomClient'
import OfflineChannelClient from './OfflineChannelClient'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'

export const dynamic = 'force-dynamic'

export default async function StreamDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const cleanParam = decodeURIComponent(username).replace(/^@/, '').replace('%40', '').trim()

  // 1. FAST SINGLE PARALLEL FETCH:
  // Query Supabase server client and the LiveStream simultaneously.
  // We include seller, live auctions with product, and recent chat messages in ONE single SQL query.
  const [supabaseClient, stream] = await Promise.all([
    createServerClient().catch(() => null),
    db.liveStream.findFirst({
      where: {
        OR: [
          { id: cleanParam },
          { seller: { username: cleanParam } },
          { seller: { id: cleanParam } },
          { seller: { username: { equals: cleanParam, mode: 'insensitive' } } }
        ]
      },
      include: {
        seller: true,
        auctions: {
          where: { status: 'live' },
          include: { product: true },
          take: 1
        },
        chatMessages: {
          where: {
            isHidden: false,
            type: { not: 'streamer-ban' }
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { sender: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch((err) => {
      console.error('[StreamDetailPage] Error fetching stream:', err)
      return null
    })
  ])

  // 2. If stream is live, return immediately (sub-150ms response)
  const isLive = Boolean(stream && (stream.isLive === true || stream.status === 'live'))

  if (isLive && stream) {
    const auction = stream.auctions?.[0] || null
    const product = auction?.product || null
    const seller = stream.seller || MOCK_PROFILES[0]

    let currentUserId: string | undefined = undefined
    let isInitiallyBlocked = false

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.auth.getUser()
        if (data?.user) {
          currentUserId = data.user.id
          const banRecord = await db.liveChatMessage.findFirst({
            where: {
              streamId: stream.id,
              type: 'streamer-ban',
              senderId: data.user.id
            },
            select: { id: true }
          })
          if (banRecord) isInitiallyBlocked = true
        }
      } catch {}
    }

    const initialChatMessages = (stream.chatMessages || []).reverse()
    const initialChat = initialChatMessages.map((msg: any) => ({
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
        currentUserId={currentUserId}
        stream={stream} 
        auction={auction} 
        product={product} 
        seller={seller}
        initialChat={initialChat}
        isInitiallyBlocked={isInitiallyBlocked}
      />
    )
  }

  // 3. If stream is OFFLINE: find seller profile
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

  // 4. In parallel: fetch products and other live streams
  const [products, otherLiveStreams] = await Promise.all([
    db.product.findMany({
      where: {
        sellerId: seller.id,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    }).catch(() => []),
    db.liveStream.findMany({
      where: {
        isLive: true,
        ...(stream ? { id: { not: stream.id } } : {})
      },
      include: { seller: true },
      orderBy: { viewerCount: 'desc' },
      take: 4
    }).catch(() => [])
  ])

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
