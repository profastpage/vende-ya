'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createKickStream(title: string, kickUsername: string, isAuction: boolean, price: number) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Debes iniciar sesión para transmitir')
  }

  // 1. Create dummy product for the stream
  const product = await db.product.create({
    data: {
      id: `prod-${Date.now()}`,
      sellerId: user.id,
      title: title,
      description: 'Producto vendido en transmisión en vivo por Kick',
      price: price,
      currency: 'PEN',
      stock: 1,
      images: "[]",
      status: 'active'
    }
  })

  // 2. Create the Live Stream record
  const stream = await db.liveStream.create({
    data: {
      id: `stream-${Date.now()}`,
      sellerId: user.id,
      title: title,
      streamKey: `kick-${Date.now()}`,
      isLive: true,
      status: 'live',
      kickUsername: kickUsername.toLowerCase().trim()
    }
  })

  // 3. Create the auction if applicable
  if (isAuction) {
    await db.auction.create({
      data: {
        id: `auc-${Date.now()}`,
        productId: product.id,
        sellerId: user.id,
        streamId: stream.id,
        startingPrice: price,
        currentPrice: price,
        status: 'live',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes default for testing
      }
    })
  }

  revalidatePath('/')
  return { success: true, streamId: stream.id }
}