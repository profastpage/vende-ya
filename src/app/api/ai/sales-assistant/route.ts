import { NextRequest, NextResponse } from 'next/server'
import { salesAssistant, type AssistantContext } from '@/lib/vendeda/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/sales-assistant
 * Body: { question: string, context: AssistantContext }
 * Returns: { answer, confidence, suggestedAction? }
 *
 * Server-side RAG sales assistant. Pre-filters common questions to
 * avoid hitting the LLM. Falls back to Qwen-2.5-72B for ambiguous
 * queries about the product.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string | undefined = body?.question
    const ctx: AssistantContext | undefined = body?.context

    if (typeof question !== 'string' || !ctx) {
      return NextResponse.json(
        { error: 'Missing "question" or "context" field' },
        { status: 400 }
      )
    }
    const result = await salesAssistant(question, ctx)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/ai/sales-assistant]', err)
    return NextResponse.json(
      { error: 'Sales assistant failed' },
      { status: 500 }
    )
  }
}
