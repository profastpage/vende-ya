'use server'
import { db } from '@/lib/db'

export async function incrementStreamLikes(streamId: string, count: number) {
  try {
    await db.liveStream.update({
      where: { id: streamId },
      data: { likeCount: { increment: count } }
    })
    return { success: true }
  } catch(e) {
    console.error("Error incrementing likes:", e)
    return { error: "Failed" }
  }
}