import { SocialVideoFeed, SocialFeedItem } from '@/components/vendeda/SocialVideoFeed'
import { MOCK_STREAMS } from '@/lib/vendeda/mock-data'

export default function Home() {
  const feed: SocialFeedItem[] = MOCK_STREAMS.map(stream => ({
    id: stream.id,
    videoUrl: 'https://via.placeholder.com/1080x1920', // Mock video URL
    thumbnailUrl: stream.thumbnailUrl || 'https://via.placeholder.com/1080x1920',
    seller: {
      displayName: stream.seller?.displayName || 'Usuario',
      avatarUrl: stream.seller?.avatarUrl || undefined,
    },
    description: stream.title,
    likes: Math.floor(Math.random() * 10000) + 100,
    comments: Math.floor(Math.random() * 1000) + 10,
    shares: Math.floor(Math.random() * 500) + 5,
    product: {
      id: 'p1',
      title: stream.title + ' (Producto en vivo)',
      price: Math.floor(Math.random() * 100) + 50,
      thumbnail: stream.thumbnailUrl || 'https://via.placeholder.com/150x150'
    },
    liveComments: [
      { id: 'c1', user: 'carlos_99', text: '¡Increíble producto!' },
      { id: 'c2', user: 'maria_venta', text: '¿Haces envíos a provincia?' },
      { id: 'c3', user: 'pedro_lopez', text: 'Me interesa la oferta.' },
      { id: 'c4', user: 'ana_123', text: '¡Lo quiero ya!' },
    ]
  }))

  return (
    <main className="bg-black w-full min-h-screen">
      <SocialVideoFeed feed={feed} />
    </main>
  )
}
