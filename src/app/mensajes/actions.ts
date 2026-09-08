'use server'

import { createServerClient } from '@/lib/vendeda/supabase-server'
import { db } from '@/lib/db'

export interface ConversationSummary {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  isVerified: boolean
  lastMsg: string
  lastTime: number
  unread: boolean
  unreadCount: number
}

export interface ChatMessage {
  id: string
  fromMe: boolean
  text: string
  time: number
  read: boolean
}

/**
 * Fetch all direct conversations for the authenticated user from real PostgreSQL DB.
 * Returns empty array if user has 0 messages.
 */
export async function getConversations(): Promise<{ success: boolean; conversations: ConversationSummary[] }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, conversations: [] }
    }

    // Ensure Profile exists for user
    let myProfile = await db.profile.findFirst({
      where: { OR: [{ id: user.id }, { authId: user.id }] },
    })

    if (!myProfile) {
      return { success: true, conversations: [] }
    }

    const myId = myProfile.id

    // Fetch all direct messages involving this user
    const messages = await db.directMessage.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    if (messages.length === 0) {
      return { success: true, conversations: [] }
    }

    // Group by the other user ID
    const grouped = new Map<
      string,
      {
        lastMsg: string
        lastTime: number
        unreadCount: number
      }
    >()

    for (const msg of messages) {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId
      const existing = grouped.get(otherId)

      const isUnread = msg.receiverId === myId && !msg.read

      if (!existing) {
        grouped.set(otherId, {
          lastMsg: msg.content,
          lastTime: new Date(msg.createdAt).getTime(),
          unreadCount: isUnread ? 1 : 0,
        })
      } else if (isUnread) {
        existing.unreadCount += 1
      }
    }

    // Fetch profiles for other users
    const otherUserIds = Array.from(grouped.keys())
    const profiles = await db.profile.findMany({
      where: { id: { in: otherUserIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
      },
    })

    const profileMap = new Map(profiles.map((p) => [p.id, p]))

    const conversations: ConversationSummary[] = []
    for (const [otherId, info] of grouped.entries()) {
      const p = profileMap.get(otherId)
      if (p) {
        conversations.push({
          userId: p.id,
          username: p.username,
          displayName: p.displayName || p.username,
          avatarUrl: p.avatarUrl,
          isVerified: p.isVerified,
          lastMsg: info.lastMsg,
          lastTime: info.lastTime,
          unread: info.unreadCount > 0,
          unreadCount: info.unreadCount,
        })
      }
    }

    // Sort by latest message
    conversations.sort((a, b) => b.lastTime - a.lastTime)

    return { success: true, conversations }
  } catch (err) {
    console.error('[getConversations] Error:', err)
    return { success: false, conversations: [] }
  }
}

/**
 * Fetch messages between current user and target user.
 */
export async function getMessages(otherUserId: string): Promise<{ success: boolean; messages: ChatMessage[] }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !otherUserId) {
      return { success: false, messages: [] }
    }

    const myProfile = await db.profile.findFirst({
      where: { OR: [{ id: user.id }, { authId: user.id }] },
    })

    if (!myProfile) {
      return { success: true, messages: [] }
    }

    const myId = myProfile.id

    // Mark incoming messages as read
    await db.directMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: myId,
        read: false,
      },
      data: { read: true },
    })

    const rawMessages = await db.directMessage.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    const messages: ChatMessage[] = rawMessages.map((m) => ({
      id: m.id,
      fromMe: m.senderId === myId,
      text: m.content,
      time: new Date(m.createdAt).getTime(),
      read: m.read,
    }))

    return { success: true, messages }
  } catch (err) {
    console.error('[getMessages] Error:', err)
    return { success: false, messages: [] }
  }
}

/**
 * Send a direct message to a user.
 */
export async function sendMessage(receiverId: string, content: string): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para enviar mensajes.' }
    }

    const cleanText = content.trim()
    if (!cleanText) {
      return { success: false, error: 'El mensaje no puede estar vacío.' }
    }

    let myProfile = await db.profile.findFirst({
      where: { OR: [{ id: user.id }, { authId: user.id }] },
    })

    if (!myProfile) {
      myProfile = await db.profile.create({
        data: {
          id: user.id,
          authId: user.id,
          username: `user_${user.id.substring(0, 8)}`,
          displayName: user.email?.split('@')[0] || 'Usuario',
        },
      })
    }

    const msg = await db.directMessage.create({
      data: {
        senderId: myProfile.id,
        receiverId,
        content: cleanText,
        read: false,
      },
    })

    return {
      success: true,
      message: {
        id: msg.id,
        fromMe: true,
        text: msg.content,
        time: new Date(msg.createdAt).getTime(),
        read: false,
      },
    }
  } catch (err: any) {
    console.error('[sendMessage] Error:', err)
    return { success: false, error: err.message || 'Error al enviar mensaje' }
  }
}

/**
 * Resolve profile by username or id (used when URL is ?u=username).
 */
export async function getUserByUsername(usernameOrId: string) {
  try {
    const clean = decodeURIComponent(usernameOrId).replace(/^@/, '').trim()
    const profile = await db.profile.findFirst({
      where: {
        OR: [
          { username: clean },
          { id: clean },
          { authId: clean },
          { username: { equals: clean, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
        department: true,
      },
    })

    return { success: true, profile }
  } catch (err) {
    console.error('[getUserByUsername] Error:', err)
    return { success: false, profile: null }
  }
}
