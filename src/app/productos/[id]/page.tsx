import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProductDetailsClient from './ProductDetailsClient'

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await db.product.findUnique({
    where: { id },
    include: {
      seller: true,
      category: true
    }
  })

  if (!product) {
    notFound()
  }

  // Fetch reviews for this seller
  const reviews = await db.review.findMany({
    where: { revieweeId: product.sellerId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      reviewer: {
        select: { displayName: true, avatarUrl: true }
      },
      order: true
    }
  })

  // Parse images if needed
  let images: string[] = ['https://placehold.co/800x1200/1a1a1a/333333.png?text=Product']
  try {
    const parsed = JSON.parse(product.images)
    if (Array.isArray(parsed) && parsed.length > 0) {
      images = parsed
    } else if (typeof product.images === 'string' && product.images.startsWith('http')) {
      images = [product.images]
    }
  } catch (e) {
    if (typeof product.images === 'string' && product.images.startsWith('http')) {
      images = [product.images]
    }
  }

  return <ProductDetailsClient product={{ ...product, images }} seller={product.seller} reviews={reviews} />
}