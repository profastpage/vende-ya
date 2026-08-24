'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function markAsRead(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  await db.notification.update({
    where: { id, userId: user.id },
    data: { isRead: true }
  })
  revalidatePath('/notificaciones')
  return true
}

export async function markAllAsRead() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true }
  })
  revalidatePath('/notificaciones')
  return true
}