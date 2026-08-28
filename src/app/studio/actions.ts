'use server'
import { db } from '@/lib/db'

export async function createExpressProduct(streamId: string, sellerId: string, title: string, basePrice: number, isAuction: boolean) {
  try {
    const product = await db.product.create({
      data: {
        sellerId,
        title,
        description: 'Producto express lanzado durante la transmisión.',
        basePrice,
        status: 'active',
        stock: 1,
        isLiveOnly: true,
        images: '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60"]'
      }
    });

    // We ALWAYS create an Auction record to link the product to the stream in the current schema
    const auction = await db.auction.create({
      data: {
        productId: product.id,
        sellerId: sellerId,
        streamId: streamId,
        startingPrice: isAuction ? Math.max(1, basePrice * 0.5) : basePrice,
        buyNowPrice: basePrice,
        currentPrice: isAuction ? Math.max(1, basePrice * 0.5) : basePrice,
        status: 'active',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3 * 60 * 1000)
      }
    });

    return { success: true, product, auction };
  } catch(e) {
    console.error("Error creating express product:", e)
    return { error: "Failed to create product" }
  }
}

export async function endStream(streamId: string) {
  try {
    await db.liveStream.update({
      where: { id: streamId },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });
    return { success: true };
  } catch(e) {
    return { error: 'Failed to end stream' };
  }
}
