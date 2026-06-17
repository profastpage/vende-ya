import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/auctions
 * Query: ?status=live&limit=20&offset=0
 *
 * Returns a list of auctions with seller + product joined. Used by
 * the marketplace feed. In a Supabase deployment this maps to a
 * PostgREST RPC `get_auctions(status, limit, offset)`.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') ?? 'live'
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)

    const auctions = await db.auction.findMany({
      where: status === 'all' ? {} : { status: status as any },
      include: {
        seller: true,
        product: true,
        stream: true,
      },
      orderBy: { startsAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({ auctions, total: auctions.length })
  } catch (err) {
    console.error('[/api/auctions GET]', err)
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}
