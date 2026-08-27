import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { createServerClient } from '@/lib/vendeda/supabase-server'
import { StreamControlPanel } from '@/components/vendeda/StreamControlPanel'

export default async function StudioPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Find active stream for this seller
  const activeStream = await db.liveStream.findFirst({
    where: { 
      sellerId: user.id,
      isLive: true
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!activeStream) {
    redirect('/vender?mode=live_shopping')
  }

  return <StreamControlPanel stream={activeStream} />
}