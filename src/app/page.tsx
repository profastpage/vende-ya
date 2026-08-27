import { SocialVideoFeed, SocialFeedItem } from '@/components/vendeda/SocialVideoFeed'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

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
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Database connection or table error during build:", error)
    // Silently continue with empty array so Vercel can finish compiling
  }

  // 2. Filtrar para mantener solo 1 stream por vendedor
  const uniqueStreams = streams.reduce((acc, current) => {
    const exists = acc.find((stream: any) => stream.sellerId === current.sellerId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Map to SocialFeedItem format
  const feed: SocialFeedItem[] = uniqueStreams.map((stream: any) => {
    const activeAuction = stream.auctions[0]
    
    return {
      id: stream.id,
      videoUrl: stream.playbackId ? `https://customer-xxx.cloudflarestream.com/${stream.playbackId}/manifest/video.m3u8` : 'https://placehold.co/1080x1920/1a1a1a/333333.png?text=Live',
      thumbnailUrl: stream.thumbnailUrl || 'https://placehold.co/1080x1920/1a1a1a/333333.png?text=Live',
      kickUsername: stream.kickUsername || undefined,
      youtubeLiveId: stream.youtubeLiveId || undefined,
      streamProvider: stream.streamProvider || undefined,
      streamProviderId: stream.streamProviderId || undefined,
      seller: {
        username: stream.seller?.username || 'usuario',
        displayName: stream.seller?.displayName || 'Usuario',
        avatarUrl: stream.seller?.avatarUrl || undefined,
      },
      description: stream.title,
      likes: stream.likeCount,
      comments: stream.chatMessages?.length || 0, // approximation
      shares: stream.shareCount,
      product: activeAuction ? {
        id: activeAuction.product.id,
        title: activeAuction.product.title,
        price: activeAuction.currentPrice,
        thumbnail: 'https://placehold.co/150x150/1a1a1a/333333.png?text=Item' // Ideally from activeAuction.product.images
      } : undefined,
      liveComments: stream.chatMessages ? stream.chatMessages.map((msg: any) => ({
        id: msg.id,
        user: msg.sender?.displayName || msg.guestName || 'Usuario',
        text: msg.content
      })).reverse() : [] // Show chronological
    }
  })

  // CERO MOCKS: Solo devolvemos los datos reales, si no hay ninguno, array vacio.
  return (
    <main className="w-full h-[calc(100dvh-152px)] md:h-[calc(100dvh-64px)] bg-black overflow-hidden flex flex-col">
      {feed.length > 0 ? (
        <SocialVideoFeed feed={feed} />
      ) : (
        <div className="flex w-full h-full items-center justify-center text-white/50 text-sm p-4 text-center">
          No hay transmisiones en vivo en este momento.
        </div>
      )}
    </main>
  )
}
