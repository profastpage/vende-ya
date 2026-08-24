const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\hooks\\useLiveViewers.ts');
let text = fs.readFileSync(file, 'utf8');

const newHook = `import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useLiveViewers(streamId: string, initialCount: number) {
  const [viewers, setViewers] = useState(initialCount)

  useEffect(() => {
    if (!streamId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Use a unique channel name for reading presence to avoid conflicts 
    // with other components reading the same stream!
    // Wait, presence is tied to the channel name. We MUST use chat_\${streamId}.
    // To avoid the "already subscribed" error, we can remove the channel first, OR
    // just use a separate client. Actually, createBrowserClient memoizes.
    
    let channel = supabase.getChannels().find(c => c.topic === \`realtime:chat_\${streamId}\`)
    
    if (!channel) {
      channel = supabase.channel(\`chat_\${streamId}\`, {
        config: { presence: { key: 'viewer_hub_' + Math.random().toString(36).substr(2,9) } }
      })
      
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        let count = 0
        for (const key in state) {
          count += state[key].length
        }
        setViewers(count)
      })
      
      channel.subscribe()
    } else {
      // If it exists, just read the state periodically or rely on the other component
      const updateCount = () => {
        const state = channel.presenceState()
        let count = 0
        for (const key in state) {
          count += state[key].length
        }
        setViewers(count)
      }
      updateCount()
      channel.on('presence', { event: 'sync' }, updateCount) // This might throw if already subscribed!
    }

    return () => {
      // Don't remove channel if it's shared
    }
  }, [streamId])

  return viewers
}
`;

fs.writeFileSync(file, newHook, 'utf8');