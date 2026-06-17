import { NextRequest, NextResponse } from 'next/server'
import { moderateChat } from '@/lib/vendeda/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/moderate-chat
 * Body: { text: string, senderId?: string, streamId?: string }
 * Returns: { category, score, flagged, reason? }
 *
 * Used as the server-side moderation fallback. The rule-based
 * prefilter handles the obvious cases at zero cost; the LLM only
 * fires on ambiguous messages.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (typeof body?.text !== 'string') {
      return NextResponse.json(
        { error: 'Missing "text" field' },
        { status: 400 }
      )
    }
    const result = await moderateChat({
      text: body.text,
      senderId: body.senderId,
      streamId: body.streamId,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/ai/moderate-chat]', err)
    return NextResponse.json(
      { error: 'Moderation pipeline failed' },
      { status: 500 }
    )
  }
}
