'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'


function extractYouTubeID(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (e) {
    return null;
  }
}

export async function createYouTubeStream(title: string, youtubeUrl: string, isAuction: boolean, price: number) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Tu sesión ha expirado o no estás logueado. Por favor, vuelve a iniciar sesión.' }
  }

try {

    const videoId = extractYouTubeID(youtubeUrl);
    if (!videoId) {
      return { success: false, error: 'El enlace de YouTube no es válido. Asegúrate de copiar el link correcto (ej: https://www.youtube.com/watch?v=... o https://youtu.be/...)' }
    }

    // 0. Ensure Profile exists to prevent Foreign Key constraints
    let profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) {
      // Try to find by authId just in case
      profile = await db.profile.findUnique({ where: { authId: user.id } });
    }
    
    if (!profile) {
      // Create a default profile on the fly
      profile = await db.profile.create({
        data: {
          id: user.id, // Force ID to match Supabase for easier relations
          authId: user.id,
          username: `user_${user.id.substring(0,8)}`,
          displayName: user.email?.split('@')[0] || 'Usuario',
        }
      });
    }

    // 1. Create dummy product for the stream

    const product = await db.product.create({
      data: {
        id: `prod-${Date.now()}`,
        sellerId: user.id,
        title: title,
        description: 'Producto vendido en transmisión en vivo por YouTube',
        basePrice: price,
        currency: 'PEN',
        stock: 1,
          isLiveOnly: true,
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
        streamKey: `yt-${Date.now()}`,
        isLive: true,
        status: 'live',
        youtubeLiveId: videoId,
        kickUsername: null
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
  } catch (error: any) {
    console.error('Error in createKickStream:', error);
    return { success: false, error: 'Error BD: ' + (error.message || error.toString()) }
  }
}