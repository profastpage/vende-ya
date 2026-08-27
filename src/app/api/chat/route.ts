import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { streamId, username, text, color, isBot, senderId } = await req.json()
    const msg = await db.liveChatMessage.create({
      data: {
        streamId,
        guestName: username,
        senderId: senderId || null,
        content: text,
        type: isBot ? 'ai' : 'user',
      }
    })
    return NextResponse.json(msg)
  } catch (error) {
    console.error('Chat insert error', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
