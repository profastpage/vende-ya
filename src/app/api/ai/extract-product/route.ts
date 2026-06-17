import { NextRequest, NextResponse } from 'next/server'
import { extractProductFromText } from '@/lib/vendeda/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/ai/extract-product
 * Body: { text: string }
 * Returns: ExtractedProduct
 *
 * Powers the "Quick Auction" FAB: the seller just speaks/types a
 * free description of what they want to sell; the LLM extracts a
 * structured product draft they can edit.
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
    const result = await extractProductFromText(body.text)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/ai/extract-product]', err)
    return NextResponse.json(
      { error: 'Product extraction failed' },
      { status: 500 }
    )
  }
}
