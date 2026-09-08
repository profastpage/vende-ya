'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { safeProductImages } from '@/lib/vendeda/images'

export async function getMyProducts() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, products: [] }
    }

    const rawProducts = await db.product.findMany({
      where: {
        OR: [
          { sellerId: user.id },
          { seller: { authId: user.id } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    })

    const products = rawProducts.map((p) => {
      const images = safeProductImages(p.images)
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        basePrice: p.basePrice,
        currency: p.currency,
        stock: p.stock,
        condition: p.condition,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        images,
        category: p.category ? { name: p.category.nameEs, slug: p.category.slug } : null,
      }
    })

    return { success: true, products }
  } catch (error) {
    console.error('[getMyProducts] Error:', error)
    return { success: false, products: [] }
  }
}

export async function getMyWonAuctions() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, auctions: [] }
    }

    // Find bids where user is winner or high bidder
    const userProfile = await db.profile.findFirst({
      where: {
        OR: [{ id: user.id }, { authId: user.id }],
      },
    })

    if (!userProfile) {
      return { success: false, auctions: [] }
    }

    const rawAuctions = await db.auction.findMany({
      where: {
        winnerId: userProfile.id,
      },
      include: {
        product: true,
        seller: true,
      },
      orderBy: { endsAt: 'desc' },
      take: 10,
    })

    const auctions = rawAuctions.map((a) => {
      const images = safeProductImages(a.product?.images)
      return {
        id: a.id,
        currentPrice: a.currentPrice,
        status: a.status,
        endsAt: a.endsAt ? a.endsAt.toISOString() : new Date().toISOString(),
        product: {
          id: a.product?.id || '',
          title: a.product?.title || 'Subasta ganada',
          images,
        },
        seller: {
          id: a.seller?.id || '',
          displayName: a.seller?.displayName || 'Vendedor',
          username: a.seller?.username || 'vendedor',
        },
      }
    })

    return { success: true, auctions }
  } catch (error) {
    console.error('[getMyWonAuctions] Error:', error)
    return { success: false, auctions: [] }
  }
}
