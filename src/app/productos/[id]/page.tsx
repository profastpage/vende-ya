import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { safeProductImages } from '@/lib/vendeda/images'
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

  const images = safeProductImages(product.images)

  return <ProductDetailsClient product={{ ...product, images }} seller={product.seller} reviews={reviews} />
}