const fs = require('fs');
const path = require('path');

const hookFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\hooks\\useMultiLiveViewers.ts');
const hookContent = `import { useState, useEffect } from 'react'
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
      const channel = supabase.channel(\`chat_\${stream.id}\`, {
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
`;
fs.writeFileSync(hookFile, hookContent, 'utf8');

const hubFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(hubFile, 'utf8');

text = text.replace(
    /import \{ useLiveViewers \} from '@\/hooks\/useLiveViewers'/,
    `import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'`
);

text = text.replace(
    /function FeaturedHeroCard\(\{ stream \}: \{ stream: LiveStream \}\) \{\r?\n\s*const viewers = useLiveViewers\(stream\.id, stream\.viewerCount\)/g,
    `function FeaturedHeroCard({ stream, viewers }: { stream: LiveStream, viewers: number }) {`
);

text = text.replace(
    /function StreamCard\(\{ stream \}: \{ stream: LiveStream \}\) \{\r?\n\s*const viewers = useLiveViewers\(stream\.id, stream\.viewerCount\)/g,
    `function StreamCard({ stream, viewers }: { stream: LiveStream, viewers: number }) {`
);

text = text.replace(
    /const totalViewers = liveStreams\.reduce\(\(sum, s\) => sum \+ s\.viewerCount, 0\)/,
    `const viewersMap = useMultiLiveViewers(liveStreams.map(s => ({ id: s.id, viewerCount: s.viewerCount })))
  const totalViewers = liveStreams.reduce((sum, s) => sum + (viewersMap[s.id] || s.viewerCount), 0)`
);

text = text.replace(
    /<FeaturedHeroCard stream=\{featured\} \/>/g,
    `<FeaturedHeroCard stream={featured} viewers={viewersMap[featured.id] || featured.viewerCount} />`
);

text = text.replace(
    /<StreamCard key=\{s\.id\} stream=\{s\} \/>/g,
    `<StreamCard key={s.id} stream={s} viewers={viewersMap[s.id] || s.viewerCount} />`
);

fs.writeFileSync(hubFile, text, 'utf8');
console.log('Fixed LiveHubClient hook');