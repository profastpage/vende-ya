import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/bids
 * Body: { auctionId, bidderId, amount }
 *
 * Persists a bid to the database. The realtime broadcast is handled
 * by the Socket.io mini-service; this route is the durable record.
 *
 * In a Supabase deployment, this is replaced by the `place_bid()`
 * RPC function (see /docs/supabase-schema.sql) which atomically
 * validates + inserts + updates the auction's current_price.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { auctionId, bidderId, amount } = body as {
      auctionId: string
      bidderId: string
      amount: number
    }
    if (!auctionId || !bidderId || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Missing auctionId, bidderId, or amount' },
        { status: 400 }
      )
    }

    // Lock the auction row for atomic validation
    const auction = await db.auction.findUnique({ where: { id: auctionId } })
    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    }
    if (auction.status !== 'live') {
      return NextResponse.json({ error: 'Auction is not live' }, { status: 400 })
    }
    const minBid = auction.currentPrice + auction.bidIncrement
    if (amount < minBid) {
      return NextResponse.json(
        { error: `Bid must be >= ${minBid}`, minBid },
        { status: 400 }
      )
    }

    // Mark previous winning bids as not winning
    await db.bid.updateMany({
      where: { auctionId, isWinning: true },
      data: { isWinning: false },
    })

    // Insert new winning bid
    const bid = await db.bid.create({
      data: {
        auctionId,
        bidderId,
        amount,
        isWinning: true,
      },
    })

    // Update auction current price + bid count
    await db.auction.update({
      where: { id: auctionId },
      data: {
        currentPrice: amount,
        bidCount: { increment: 1 },
      },
    })

    return NextResponse.json({ ok: true, bid })
  } catch (err) {
    console.error('[/api/bids POST]', err)
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    )
  }
}
