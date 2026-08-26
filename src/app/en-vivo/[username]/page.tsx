import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import LiveRoomClient from './LiveRoomClient'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'

export const dynamic = 'force-dynamic'

export default async function StreamDetailPage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { username } = await params
  
  // 1. Fetch real stream from DB
  const stream = await db.liveStream.findFirst({
    where: { 
      seller: { username },
      status: 'live',
      isLive: true
    },
    include: { seller: true }
  })
  
  if (!stream) {
    notFound()
  }

  // 2. Fetch active auction for this stream
  const auction = await db.auction.findFirst({
    where: { streamId: stream.id, status: 'live' },
    include: { product: true }
  })

  const product = auction?.product || null
  const seller = stream.seller || MOCK_PROFILES[0]

  const initialChatMessages = await db.liveChatMessage.findMany({
    where: { streamId: stream.id },
    orderBy: { createdAt: 'asc' },
    take: 100
  })

  const initialChat = initialChatMessages.map(msg => ({
    id: msg.id,
    username: msg.guestName || 'Usuario',
    text: msg.content,
    color: msg.type === 'ai' ? 'text-purple-400' : 'text-white',
    isBot: msg.type === 'ai'
  }))

  return (
    <LiveRoomClient 
      currentUserId={user?.id}
      stream={stream} 
      auction={auction} 
      product={product} 
      seller={seller}
      initialChat={initialChat}
    />
  )
}
