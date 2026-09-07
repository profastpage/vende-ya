import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import SellerProfileClient from './SellerProfileClient'

export default async function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  // The username in the URL might have an @ sign or url-encoded characters
  const cleanUsername = decodeURIComponent(username).replace(/^@/, '').replace('%40', '').trim()

  let profile: any = null
  try {
    profile = await db.profile.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { id: cleanUsername },
          { authId: cleanUsername },
          { username: { equals: cleanUsername, mode: 'insensitive' } }
        ]
      }
    })
  } catch (err) {
    console.error('[SellerProfile] Profile lookup error:', err)
  }

  if (!profile) {
    notFound()
  }

  // 1. Fetch active stream
  let activeStream: any = null
  try {
    activeStream = await db.liveStream.findFirst({
      where: { sellerId: profile.id, isLive: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (err) {
    console.error('[SellerProfile] liveStream active error:', err)
  }

  // 2. Fetch past streams (VOD)
  let pastStreams: any[] = []
  try {
    pastStreams = await db.liveStream.findMany({
      where: { sellerId: profile.id, status: 'ended' },
      orderBy: { endedAt: 'desc' },
      take: 10
    })
  } catch (err) {
    console.error('[SellerProfile] pastStreams error:', err)
  }

  // 3. Fetch products
  let rawProducts: any[] = []
  try {
    rawProducts = await db.product.findMany({
      where: { sellerId: profile.id, status: 'active', isLiveOnly: false },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
  } catch (err) {
    console.error('[SellerProfile] products error:', err)
  }

  // Parse product images JSON into string arrays so client component never crashes
  const products = rawProducts.map((p) => {
    let images: string[] = []
    try {
      images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
    } catch {
      images = typeof p.images === 'string' && p.images.startsWith('http') ? [p.images] : []
    }
    return {
      ...p,
      images: Array.isArray(images) && images.length > 0 
        ? images 
        : ['https://placehold.co/400x400/1a1a1a/333333.png?text=Producto']
    }
  })

  // 4. Fetch reviews (without unnecessary order join that could break)
  let reviews: any[] = []
  try {
    reviews = await db.review.findMany({
      where: { revieweeId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: { displayName: true, avatarUrl: true }
        }
      }
    })
  } catch (err) {
    console.error('[SellerProfile] reviews error:', err)
  }

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