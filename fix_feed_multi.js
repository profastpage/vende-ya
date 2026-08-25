const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

const dynamicPlayerStr = `
function DynamicLivePlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
  const containerClasses = "relative w-full h-full bg-black";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://player.twitch.tv/?channel=\${providerId}&parent=\${domain}&muted=false&autoplay=true&playsinline=true\`} className="w-full h-full border-none" allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://kick.com/\${providerId}/embed\`} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe src={\`https://www.youtube.com/embed/\${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1\`} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}
`;

text = text.replace(/export default function SocialVideoFeed/, dynamicPlayerStr + '\nexport default function SocialVideoFeed');

text = text.replace(/\{item\.youtubeLiveId \|\| item\.kickUsername \? \([\s\S]*?<\/div>\r?\n\s*\) : \(/,
`{item.streamProviderId || item.youtubeLiveId || item.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full">
                <DynamicLivePlayer provider={item.streamProvider || 'YOUTUBE'} providerId={item.streamProviderId || item.youtubeLiveId || item.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed feed');