const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
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

  if (provider === 'YOUTUBE' || !provider) {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://www.youtube.com/embed/\${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1\`} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
      </div>
    );
  }

  return <div className="text-white flex items-center justify-center h-full">Transmisión no disponible</div>;
}
`;

// Insert the dynamic player at the top (after imports)
text = text.replace(/export default function LiveRoomClient/, dynamicPlayerStr + '\nexport default function LiveRoomClient');

// Replace desktop player
text = text.replace(/<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">[\s\S]*?<\/div>/,
`<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
          </div>`);

// Replace mobile player
text = text.replace(/<div className="relative w-full h-full">[\s\S]*?<\/div>/,
`<div className="relative w-full h-full">
            <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
          </div>`);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient');