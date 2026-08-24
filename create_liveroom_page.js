const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');

const content = `import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import LiveRoomClient from './LiveRoomClient'
import { MOCK_AUCTION, MOCK_PROFILES } from '@/lib/vendeda/mock-data'

export const dynamic = 'force-dynamic'

export default async function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 1. Fetch real stream from DB
  const stream = await db.liveStream.findUnique({
    where: { id },
    include: { seller: true }
  })
  
  if (!stream) {
    notFound()
  }

  // 2. Fetch active auction for this stream
  const auction = await db.auction.findFirst({
    where: { streamId: stream.id, status: 'live' },
    include: { product: true }
  }) || MOCK_AUCTION

  const product = auction.product
  const seller = stream.seller || MOCK_PROFILES[0]

  return (
    <LiveRoomClient 
      stream={stream} 
      auction={auction} 
      product={product} 
      seller={seller} 
    />
  )
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Created page.tsx Server Component for live room');