const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const dynamicPlayerStr = `
function DynamicLivePlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
  const containerClasses = "relative w-full h-full bg-black pointer-events-none";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://player.twitch.tv/?channel=\${providerId}&parent=\${domain}&muted=true&autoplay=true&playsinline=true\`} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://kick.com/\${providerId}/embed\`} className="w-full h-full border-none pointer-events-none" allowFullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe src={\`https://www.youtube.com/embed/\${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0\`} className="w-full h-full border-none pointer-events-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}
`;

text = text.replace(/export default function LiveHubClient/, dynamicPlayerStr + '\nexport default function LiveHubClient');

// Replace Hero iframe
text = text.replace(/\{stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <div className="relative w-full aspect-video pointer-events-none">
              <DynamicLivePlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
            </div>
          </div>
        ) : (`);

// Replace Card iframe
text = text.replace(/\{stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full pointer-events-none">
                <DynamicLivePlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed hub');