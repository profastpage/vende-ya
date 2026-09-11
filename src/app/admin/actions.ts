'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

const SUPER_ADMIN_EMAIL = 'profastpage@gmail.com'

async function verifySuperAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    throw new Error('No autorizado. Solo el Dios Supremo puede hacer esto.')
  }
}

export async function banUser(userId: string) {
  await verifySuperAdmin()
  
  await db.profile.update({
    where: { id: userId },
    data: { 
      isBanned: true, 
      bannedReason: "Baneado por el Super Admin" 
    }
  })
  
  // Opcional: También banear su billetera de vendedor si existe
  try {
    await db.sellerWallet.updateMany({
      where: { id: userId }, // Asumiendo que el wallet comparte ID con auth en Prod
      data: { status: 'banned' }
    })
  } catch(e) {}
  
  revalidatePath('/admin')
}

export async function unbanUser(userId: string) {
  await verifySuperAdmin()
  
  await db.profile.update({
    where: { id: userId },
    data: { 
      isBanned: false, 
      bannedReason: null 
    }
  })
  
  revalidatePath('/admin')
}

export async function killStream(streamId: string) {
  await verifySuperAdmin()
  
  await db.liveStream.update({
    where: { id: streamId },
    data: { 
      status: 'ended', 
      isLive: false,
      endedAt: new Date()
    }
  })
  
  // Terminar todas las subastas activas de ese stream
  await db.auction.updateMany({
    where: { streamId, status: 'live' },
    data: { status: 'canceled' }
  })
  
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function killAllGhostStreams() {
  try {
    await db.liveStream.updateMany({
      where: { isLive: true },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch(e) {
    return { error: 'Failed to kill all streams' };
  }
}

export async function deleteStream(streamId: string) {
  await verifySuperAdmin()
  
  try {
    await db.auction.updateMany({
      where: { streamId },
      data: { status: 'canceled' }
    })
    
    await db.liveChatMessage.deleteMany({
      where: { streamId }
    }).catch(() => {})
    
    await db.liveStream.delete({
      where: { id: streamId }
    })
    
    revalidatePath('/admin')
    revalidatePath('/')
    revalidatePath('/en-vivo')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting stream:', error)
    return { error: error.message || 'Error al eliminar la transmisión' }
  }
}

export async function suspendSellerAndKillStream(streamId: string) {
  await verifySuperAdmin()
  
  try {
    const stream = await db.liveStream.findUnique({
      where: { id: streamId },
      select: { sellerId: true }
    })
    
    if (stream) {
      await db.liveStream.update({
        where: { id: streamId },
        data: { status: 'ended', isLive: false, endedAt: new Date() }
      })
      
      await db.auction.updateMany({
        where: { streamId, status: 'live' },
        data: { status: 'canceled' }
      })
      
      if (stream.sellerId) {
        await db.profile.update({
          where: { id: stream.sellerId },
          data: { 
            isBanned: true, 
            bannedReason: 'Cuenta suspendida por el Super Admin por infracción en transmisión en vivo' 
          }
        })
      }
    }
    
    revalidatePath('/admin')
    revalidatePath('/')
    revalidatePath('/en-vivo')
    return { success: true }
  } catch (error: any) {
    console.error('Error suspending seller:', error)
    return { error: error.message || 'Error al suspender al vendedor' }
  }
}
