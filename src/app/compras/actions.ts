'use server'

import { db } from '@/lib/db'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { revalidatePath } from 'next/cache'

export async function submitReview({
  orderId,
  sellerId,
  rating,
  comment,
}: {
  orderId: string;
  sellerId: string;
  rating: number;
  comment?: string;
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para calificar.' }
  }

  try {
    const existing = await db.review.findFirst({
      where: { orderId }
    })

    if (existing) {
      return { success: false, error: 'Ya has calificado esta compra.' }
    }

    let buyerProfile = await db.profile.findUnique({ where: { id: user.id } })
    if (!buyerProfile) {
      buyerProfile = await db.profile.create({
        data: {
          id: user.id,
          authId: user.id,
          username: 'user_' + user.id.substring(0, 8),
          displayName: user.email?.split('@')[0] || 'Comprador'
        }
      })
    }

    const review = await db.review.create({
      data: {
        orderId,
        revieweeId: sellerId,
        reviewerId: user.id,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: comment?.trim() || null,
      }
    })

    const allReviews = await db.review.findMany({
      where: { revieweeId: sellerId }
    })

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await db.profile.update({
      where: { id: sellerId },
      data: {
        rating: Number(avgRating.toFixed(1)),
        ratingsCount: allReviews.length,
      }
    })

    try {
      await db.notification.create({
        data: {
          userId: sellerId,
          title: '⭐ ¡Nueva Calificación Recibida!',
          body: `Un comprador te ha calificado con ${rating} estrellas por tu venta.`,
          type: 'review_received',
          linkUrl: `/vendedores/${user.id}`,
        }
      })
    } catch (e) {}

    revalidatePath('/compras')
    revalidatePath('/dashboard')
    return { success: true, review }
  } catch (error: any) {
    console.error('Error in submitReview:', error)
    return { success: false, error: 'No se pudo guardar la reseña: ' + (error.message || error.toString()) }
  }
}