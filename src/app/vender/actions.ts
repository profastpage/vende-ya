'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'



export async function parseStreamUrl(url: string) {
  if (url.includes('youtu') || url.includes('youtube')) {
    const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) return { provider: 'YOUTUBE', id: ytMatch[2] };
  }
  return null;
}


export async function createMultiStream(title: string, streamUrl: string, isAuction: boolean, price: number, coverImage: string = '') {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Tu sesión ha expirado o no estás logueado. Por favor, vuelve a iniciar sesión.' }
  }

try {

    const parsedStream = await parseStreamUrl(streamUrl);
    if (!parsedStream) {
      return { success: false, error: 'El enlace no es válido. El enlace no es válido. Pega una URL correcta de YouTube en vivo.' }
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
        
        streamProvider: parsedStream.provider,
        streamProviderId: parsedStream.id,
        thumbnailUrl: coverImage || null
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

export async function endLiveStream(streamId: string) {
  const { db } = await import('@/lib/db');
  const { revalidatePath } = await import('next/cache');
  
  await db.liveStream.update({
    where: { id: streamId },
    data: { 
      isLive: false,
      status: 'ended',
      endedAt: new Date()
    }
  });
  
  revalidatePath('/');
  revalidatePath('/marketplace');
  return { success: true };
}

export async function createMarketplaceProduct(data: {
  title: string;
  description: string;
  basePrice: number;
  categorySlug?: string;
  condition: string;
  stock: number;
  images: string[];
  shippingCost?: number;
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Tu sesión ha expirado o no estás logueado. Por favor, vuelve a iniciar sesión.' }
  }

  try {
    // 1. Ensure Profile exists
    let profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) {
      profile = await db.profile.findUnique({ where: { authId: user.id } });
    }
    if (!profile) {
      profile = await db.profile.create({
        data: {
          id: user.id,
          authId: user.id,
          username: `user_${user.id.substring(0,8)}`,
          displayName: user.email?.split('@')[0] || 'Usuario',
        }
      });
    }

    // 2. Find category by slug if provided
    let categoryId: string | null = null;
    if (data.categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: data.categorySlug } });
      if (cat) {
        categoryId = cat.id;
      }
    }

    const imagesJson = JSON.stringify(
      data.images && data.images.length > 0
        ? data.images
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=70']
    );

    const product = await db.product.create({
      data: {
        id: `prod-${Date.now()}`,
        sellerId: user.id,
        title: data.title,
        description: data.description || 'Sin descripción',
        basePrice: data.basePrice,
        currency: 'PEN',
        categoryId,
        condition: data.condition || 'nuevo',
        stock: Math.max(1, data.stock || 1),
        images: imagesJson,
        status: 'active',
        isLiveOnly: false,
        shipsNationwide: true,
        shippingCost: data.shippingCost || 0,
      }
    });

    revalidatePath('/marketplace');
    revalidatePath('/');
    if (profile.username) {
      revalidatePath(`/vendedores/${profile.username}`);
    }

    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error('Error in createMarketplaceProduct:', error);
    return { success: false, error: 'Error al publicar producto: ' + (error.message || error.toString()) };
  }
}
