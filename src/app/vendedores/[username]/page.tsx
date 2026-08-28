import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import SellerProfileClient from './SellerProfileClient'

export default async function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  // The username in the URL might have an @ sign. Let's remove it if present.
  const cleanUsername = username.replace('%40', '').replace('@', '')

  const profile = await db.profile.findFirst({
    where: { username: cleanUsername }
  })

  if (!profile) {
    notFound()
  }

  // 1. Fetch active stream
  const activeStream = await db.liveStream.findFirst({
    where: { sellerId: profile.id, isLive: true },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch past streams (VOD)
  const pastStreams = await db.liveStream.findMany({
    where: { sellerId: profile.id, status: 'ended' },
    orderBy: { endedAt: 'desc' },
    take: 10
  })

  // 3. Fetch products
  const products = await db.product.findMany({
    where: { sellerId: profile.id, status: 'active', isLiveOnly: false },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })

  // 4. Fetch reviews
  const reviews = await db.review.findMany({
    where: { revieweeId: profile.id },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: { displayName: true, avatarUrl: true }
      },
      order: true
    }
  })

  return (
    <SellerProfileClient 
      seller={profile} 
      activeStream={activeStream} 
      pastStreams={pastStreams} 
      products={products} 
      reviews={reviews} 
    />
  )
}