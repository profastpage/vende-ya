import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { safeProductImages } from '@/lib/vendeda/images'
import ProductDetailsClient from './ProductDetailsClient'

export const dynamic = 'force-dynamic'

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

  // Fetch reviews for this seller with safe try-catch
  let reviews: any[] = []
  try {
    reviews = await db.review.findMany({
      where: { revieweeId: product.sellerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        reviewer: {
          select: { displayName: true, avatarUrl: true }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }

  // Fallback to UserRating if no reviews in Review table
  if (reviews.length === 0) {
    try {
      const userRatings = await db.userRating.findMany({
        where: {
          OR: [
            { productId: product.id },
            { toUserId: product.sellerId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          fromUser: {
            select: { displayName: true, avatarUrl: true }
          }
        }
      })

      if (userRatings && userRatings.length > 0) {
        reviews = userRatings.map((ur) => ({
          id: ur.id,
          rating: ur.rating,
          comment: ur.review || 'Excelente producto, 100% recomendado.',
          createdAt: ur.createdAt,
          reviewer: ur.fromUser
        }))
      }
    } catch (err) {
      console.error('Error fetching userRatings fallback:', err)
    }
  }

  const images = safeProductImages(product.images)

  return (
    <ProductDetailsClient
      product={{ ...product, images }}
      seller={product.seller}
      reviews={reviews}
    />
  )
}