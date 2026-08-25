const fs = require('fs');
const path = require('path');

// 1. Update DynamicLivePlayer.tsx to support isActive
const playerFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let playerText = fs.readFileSync(playerFile, 'utf8');

playerText = playerText.replace(/export function DynamicLivePlayer\(\{ provider, providerId \}: \{ provider: string, providerId: string \}\) \{/g, 
`export function DynamicLivePlayer({ provider, providerId, isActive = true }: { provider: string, providerId: string, isActive?: boolean }) {
  if (!isActive) {
    return <div className="relative w-full h-full bg-black flex items-center justify-center text-white/30">Cargando...</div>;
  }`);

fs.writeFileSync(playerFile, playerText, 'utf8');

// 2. Update SocialVideoFeed.tsx to use IntersectionObserver and pass isActive to DynamicLivePlayer
const feedFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let feedText = fs.readFileSync(feedFile, 'utf8');

// Remove static isActive={index === 0} from feed.map
feedText = feedText.replace(/<FeedItem key=\{item\.id\} item=\{item\} isActive=\{index === 0\} viewers=\{viewersMap\[item\.id\] \|\| 0\} \/>/g, 
  `<FeedItem key={item.id} item={item} viewers={viewersMap[item.id] || 0} />`);

// Update FeedItem signature and add IntersectionObserver
feedText = feedText.replace(/function FeedItem\(\{ item, isActive, viewers = 0 \}: \{ item: SocialFeedItem; isActive: boolean; viewers\?: number \}\) \{/g, 
`function FeedItem({ item, viewers = 0 }: { item: SocialFeedItem; viewers?: number }) {
  const [isActive, setIsActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsActive(entry.isIntersecting);
        });
      },
      { threshold: 0.6 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);`);

// Add ref to the FeedItem root div
feedText = feedText.replace(/<div className="relative w-full md:w-auto h-\[100dvh\] md:h-\[calc\(100vh-64px\)\] snap-center snap-always flex justify-center shrink-0 md:py-4">/g, 
  `<div ref={containerRef} className="relative w-full md:w-auto h-[100dvh] md:h-[calc(100vh-64px)] snap-center snap-always flex justify-center shrink-0 md:py-4">`);

// Pass isActive to DynamicLivePlayer
feedText = feedText.replace(/<DynamicLivePlayer provider=\{item\.streamProvider \|\| 'YOUTUBE'\} providerId=\{item\.streamProviderId \|\| item\.youtubeLiveId \|\| item\.kickUsername \|\| ''\} \/>/g, 
  `<DynamicLivePlayer provider={item.streamProvider || 'YOUTUBE'} providerId={item.streamProviderId || item.youtubeLiveId || item.kickUsername || ''} isActive={isActive} />`);

fs.writeFileSync(feedFile, feedText, 'utf8');