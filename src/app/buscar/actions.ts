'use server'

import { db } from '@/lib/db'

export interface SearchResults {
  products: any[];
  auctions: any[];
  sellers: any[];
}

export async function searchDatabase(q: string = '', categorySlug?: string): Promise<SearchResults> {
  const query = q.trim()

  try {
    const [productsRaw, streamsRaw, sellersRaw] = await Promise.all([
      db.product.findMany({
        where: {
          status: 'active',
          isLiveOnly: false,
          ...(query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          } : {}),
          ...(categorySlug && categorySlug !== 'all' ? {
            category: { slug: categorySlug }
          } : {}),
        },
        include: { seller: true, category: true },
        take: 24,
        orderBy: { createdAt: 'desc' },
      }),

      db.liveStream.findMany({
        where: {
          status: 'live',
          isLive: true,
          ...(query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { seller: { displayName: { contains: query, mode: 'insensitive' } } },
            ],
          } : {}),
        },
        include: {
          seller: true,
          auctions: {
            where: { status: 'live' },
            include: { product: true },
            take: 1,
          },
        },
        take: 12,
        orderBy: { viewerCount: 'desc' },
      }),

      db.profile.findMany({
        where: {
          isBanned: false,
          ...(query ? {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          } : {}),
        },
        take: 12,
        orderBy: { salesCount: 'desc' },
      }),
    ])

    const products = productsRaw.map((p) => {
      let images: string[] = []
      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || [])
      } catch (e) {
        images = []
      }
      return {
        ...p,
        images: Array.isArray(images) && images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=70'],
      }
    })

    const auctions = streamsRaw.map((s) => {
      const activeAuction = s.auctions?.[0]
      const auctionProduct = activeAuction?.product
      let productImages: string[] = []
      if (auctionProduct?.images) {
        try {
          productImages = typeof auctionProduct.images === 'string' ? JSON.parse(auctionProduct.images) : auctionProduct.images
        } catch (e) {
          productImages = []
        }
      }
      if (productImages.length === 0 && s.thumbnailUrl) {
        productImages = [s.thumbnailUrl]
      }
      if (productImages.length === 0) {
        productImages = ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=70']
      }

      return {
        id: activeAuction?.id || s.id,
        status: s.status,
        currentPrice: activeAuction?.currentPrice ?? 10,
        bidCount: activeAuction?.bidCount ?? 0,
        endsAt: activeAuction?.endsAt ?? null,
        product: {
          title: auctionProduct?.title || s.title,
          images: productImages,
        },
        seller: s.seller,
        streamId: s.id,
      }
    })

    return {
      products,
      auctions,
      sellers: sellersRaw,
    }
  } catch (error) {
    console.error('Error in searchDatabase:', error)
    return {
      products: [],
      auctions: [],
      sellers: [],
    }
  }
}