'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'



export function parseStreamUrl(url: string) {
  if (url.includes('twitch.tv/')) {
    return { provider: 'TWITCH', id: url.split('twitch.tv/')[1].split('/')[0].split('?')[0] };
  }
  if (url.includes('kick.com/')) {
    return { provider: 'KICK', id: url.split('kick.com/')[1].split('/')[0].split('?')[0] };
  }
  if (url.includes('youtu') || url.includes('youtube')) {
    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) return { provider: 'YOUTUBE', id: ytMatch[2] };
  }
  return null;
}


export async function createMultiStream(title: string, streamUrl: string, isAuction: boolean, price: number) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Tu sesión ha expirado o no estás logueado. Por favor, vuelve a iniciar sesión.' }
  }

try {

    const parsedStream = parseStreamUrl(streamUrl);
    if (!parsedStream) {
      return { success: false, error: 'El enlace no es válido. Pega una URL correcta de Twitch, Kick o YouTube.' }
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
        description: 'Producto vendido en transmisión en vivo',
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
        youtubeLiveId: parsedStream.provider === 'YOUTUBE' ? parsedStream.id : null,
        kickUsername: parsedStream.provider === 'KICK' ? parsedStream.id : null,
        streamProvider: parsedStream.provider,
        streamProviderId: parsedStream.id
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