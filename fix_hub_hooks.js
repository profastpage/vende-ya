const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /import \{ LiveStream, Profile \} from '@\/lib\/vendeda\/types'/,
    `import { LiveStream, Profile } from '@/lib/vendeda/types'
import { useLiveViewers } from '@/hooks/useLiveViewers'`
);

text = text.replace(
    /function FeaturedHeroCard\(\{ stream, bucket \}: \{ stream: LiveStream; bucket: 'LIVE' \| 'UPCOMING' \| 'ENDED' \}\) \{([\s\S]*?)return \(/,
    `function FeaturedHeroCard({ stream, bucket }: { stream: LiveStream; bucket: 'LIVE' | 'UPCOMING' | 'ENDED' }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)
  $1return (`
);

text = text.replace(
    /function StreamCard\(\{ stream, bucket \}: \{ stream: LiveStream; bucket: 'LIVE' \| 'UPCOMING' \| 'ENDED' \}\) \{([\s\S]*?)return \(/,
    `function StreamCard({ stream, bucket }: { stream: LiveStream; bucket: 'LIVE' | 'UPCOMING' | 'ENDED' }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)
  $1return (`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added hooks');