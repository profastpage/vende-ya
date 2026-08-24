'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useMultiLiveViewers(initialStreams: { id: string, viewerCount: number }[]) {
  const [viewersMap, setViewersMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    initialStreams.forEach(s => map[s.id] = s.viewerCount)
    return map
  })

  useEffect(() => {
    if (initialStreams.length === 0) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channels = initialStreams.map(stream => {
      const channel = supabase.channel(`chat_${stream.id}`, {
        config: { presence: { key: 'hub_' + Math.random().toString(36).substr(2, 9) } }
      })

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        let count = 0
        for (const key in state) {
          count += state[key].length
        }
        setViewersMap(prev => ({ ...prev, [stream.id]: count }))
      })

      channel.subscribe()
      return channel
    })

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [initialStreams.map(s => s.id).join(',')])

  return viewersMap
}
