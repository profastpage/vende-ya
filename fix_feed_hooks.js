const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove useLiveViewers from FeedItem
text = text.replace(
    /const viewers = useLiveViewers\(item\.id, 0\)/,
    ''
);
text = text.replace(
    /import \{ useLiveViewers \} from '@\/hooks\/useLiveViewers'/,
    `import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'`
);

// Add useMultiLiveViewers to SocialVideoFeed
text = text.replace(
    /export function SocialVideoFeed\(\{ feed \}: SocialVideoFeedProps\) \{\r?\n\s*\/\/ Mobile-first immersive container/,
    `export function SocialVideoFeed({ feed }: SocialVideoFeedProps) {
  // Mobile-first immersive container
  const viewersMap = useMultiLiveViewers(feed.map(f => ({ id: f.id, viewerCount: 0 })))`
);

// Pass viewers down to FeedItem
text = text.replace(
    /<FeedItem key=\{item\.id\} item=\{item\} isActive=\{index === 0\} \/>/g,
    `<FeedItem key={item.id} item={item} isActive={index === 0} viewers={viewersMap[item.id] || 0} />`
);

// Add viewers to FeedItem signature
text = text.replace(
    /function FeedItem\(\{ item, isActive \}: \{ item: SocialFeedItem; isActive: boolean \}\) \{/,
    `function FeedItem({ item, isActive, viewers = 0 }: { item: SocialFeedItem; isActive: boolean; viewers?: number }) {`
);
text = text.replace(
    /function FeedItem\(\{ item \}: \{ item: SocialFeedItem; isActive: boolean \}\) \{/,
    `function FeedItem({ item, isActive, viewers = 0 }: { item: SocialFeedItem; isActive: boolean; viewers?: number }) {`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed SocialVideoFeed hooks');