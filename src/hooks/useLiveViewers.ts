import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useLiveViewers(streamId: string, initialCount: number) {
  const [viewers, setViewers] = useState(initialCount)

  useEffect(() => {
    if (!streamId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase.channel(`chat_${streamId}`, {
      config: {
        presence: {
          key: 'viewer_hub', // generic key for read-only presence
        },
      },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      let count = 0
      for (const key in state) {
        count += state[key].length
      }
      setViewers(count)
    })

    // We only subscribe to read the presence, we don't track() ourselves
    // so we don't inflate the viewers count from the catalog page!
    // Users only count as viewers when they are INSIDE the Live Room.
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [streamId])

  return viewers
}
