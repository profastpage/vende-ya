import { SocialVideoFeed, SocialFeedItem } from '@/components/vendeda/SocialVideoFeed'
import { db } from '@/lib/db'

export default async function Home() {
  // Fetch real streams from Prisma, with fallback to prevent build crashes
  let streams: any[] = []
  
  try {
    streams = await db.liveStream.findMany({
      where: {
        status: 'live',
        isLive: true,
      },
      include: {
        seller: true,
        auctions: {
          include: { product: true },
          where: { status: 'live' },
          take: 1
        },
        chatMessages: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { sender: true }
        }
      },
      orderBy: { viewerCount: 'desc' }
    })
  } catch (error) {
    console.error("Database connection or table error during build:", error)
    // Silently continue with empty array so Vercel can finish compiling
  }

  // Map to SocialFeedItem format
  const feed: SocialFeedItem[] = streams.map(stream => {
    const activeAuction = stream.auctions[0]
    
    return {
      id: stream.id,
      videoUrl: stream.playbackId ? `https://customer-xxx.cloudflarestream.com/${stream.playbackId}/manifest/video.m3u8` : 'https://via.placeholder.com/1080x1920',
      thumbnailUrl: stream.thumbnailUrl || 'https://via.placeholder.com/1080x1920',
      seller: {
        displayName: stream.seller?.displayName || 'Usuario',
        avatarUrl: stream.seller?.avatarUrl || undefined,
      },
      description: stream.title,
      likes: stream.likeCount,
      comments: stream.chatMessages.length, // approximation
      shares: stream.shareCount,
      product: activeAuction ? {
        id: activeAuction.product.id,
        title: activeAuction.product.title,
        price: activeAuction.currentPrice,
        thumbnail: 'https://via.placeholder.com/150x150' // Ideally from activeAuction.product.images
      } : undefined,
      liveComments: stream.chatMessages.map(msg => ({
        id: msg.id,
        user: msg.sender?.displayName || msg.guestName || 'Usuario',
        text: msg.content
      })).reverse() // Show chronological
    }
  })

  // If no live streams exist yet in the database, show a fallback array so the UI doesn't look broken
  const displayFeed = feed.length > 0 ? feed : [
    {
      id: 'empty',
      videoUrl: 'https://via.placeholder.com/1080x1920',
      thumbnailUrl: 'https://via.placeholder.com/1080x1920',
      seller: { displayName: 'Vende Ya Oficial' },
      description: '¡Pronto más subastas en vivo!',
      likes: 0,
      comments: 0,
      shares: 0,
      liveComments: []
    }
  ]

  return (
    <div className="bg-background w-full h-full">
      <SocialVideoFeed feed={displayFeed} />
    </div>
  )
}
