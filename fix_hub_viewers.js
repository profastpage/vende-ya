const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Import hook
text = text.replace(
    /import \{ LiveStream, Profile \} from '@\/lib\/vendeda\/types'/,
    `import { LiveStream, Profile } from '@/lib/vendeda/types'
import { useLiveViewers } from '@/hooks/useLiveViewers'`
);

// In FeaturedHeroCard
text = text.replace(
    /function FeaturedHeroCard\(\{ stream, bucket \}: \{ stream: LiveStream; bucket: 'LIVE' \| 'UPCOMING' \| 'ENDED' \}\) \{/,
    `function FeaturedHeroCard({ stream, bucket }: { stream: LiveStream; bucket: 'LIVE' | 'UPCOMING' | 'ENDED' }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)`
);

// Replace stream.viewerCount with viewers in FeaturedHeroCard
const heroCardBlock = text.match(/function FeaturedHeroCard[\s\S]*?<\/div>\r?\n\s*<\/Link>\r?\n\s*\}/)[0];
let newHeroCardBlock = heroCardBlock.replace(/stream\.viewerCount/g, 'viewers');
text = text.replace(heroCardBlock, newHeroCardBlock);

// In StreamCard
text = text.replace(
    /function StreamCard\(\{ stream, bucket \}: \{ stream: LiveStream; bucket: 'LIVE' \| 'UPCOMING' \| 'ENDED' \}\) \{/,
    `function StreamCard({ stream, bucket }: { stream: LiveStream; bucket: 'LIVE' | 'UPCOMING' | 'ENDED' }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)`
);

// Replace stream.viewerCount with viewers in StreamCard
const streamCardBlock = text.match(/function StreamCard[\s\S]*?<\/div>\r?\n\s*<\/Link>\r?\n\s*\}/)[0];
let newStreamCardBlock = streamCardBlock.replace(/stream\.viewerCount/g, 'viewers');
text = text.replace(streamCardBlock, newStreamCardBlock);

fs.writeFileSync(file, text, 'utf8');
console.log('Applied useLiveViewers to LiveHubClient');