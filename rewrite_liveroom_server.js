const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// The new unified layout implementation
const unifiedPage = `import * as React from 'react'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import LiveRoomClient from './LiveRoomClient'

export default async function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // 1. Fetch real stream from DB
  const stream = await db.liveStream.findUnique({
    where: { id },
    include: { seller: true }
  })
  
  if (!stream) {
    // Para desarrollo, podemos usar un mock de fallback temporal si no hay stream real
    const mockStream = {
      id: id,
      kickUsername: 'gozustrike',
      seller: { displayName: 'Vendedor Demo', username: 'demo', rating: 4.8 },
      title: 'Transmisión de prueba',
      viewerCount: 150
    }
    return <LiveRoomClient stream={mockStream as any} auction={null} />
  }

  // 2. Fetch active auction for this stream
  const auction = await db.auction.findFirst({
    where: { streamId: stream.id, status: 'active' },
    include: { product: true }
  })

  return <LiveRoomClient stream={stream} auction={auction} />
}
`;

fs.writeFileSync(file, unifiedPage, 'utf8');
console.log('Replaced page.tsx with Server Component');