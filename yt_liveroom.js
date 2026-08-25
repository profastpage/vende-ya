const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const oldDesktopIframe = `<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <iframe
              src={\`https://player.kick.com/\${stream?.kickUsername || 'gozustrike'}?autoplay=true&muted=false\`}
              className="absolute inset-0 w-full h-full border-none pointer-events-none origin-center" style={{ transform: 'scale(1.25)' }}
              allow="autoplay; fullscreen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />`;

const newDesktopIframe = `<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <iframe
              src={\`https://www.youtube.com/embed/\${stream?.youtubeLiveId || stream?.kickUsername || 'gozustrike'}?autoplay=1&mute=1&rel=0&modestbranding=1\`}
              title="YouTube Live Stream"
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />`;

text = text.replace(oldDesktopIframe, newDesktopIframe);

const oldMobileIframe = `<div className="absolute inset-0 z-0">
          <iframe
            src={\`https://player.kick.com/\${stream?.kickUsername || 'gozustrike'}?autoplay=true&muted=false\`}
            className="w-full h-full border-none pointer-events-none origin-center transition-transform duration-300" style={{ transform: 'scale(3.16)' }}
            allow="autoplay; fullscreen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
        </div>`;

const newMobileIframe = `<div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          <div className="relative w-full aspect-video">
            <iframe
              src={\`https://www.youtube.com/embed/\${stream?.youtubeLiveId || stream?.kickUsername || 'gozustrike'}?autoplay=1&mute=1&rel=0&modestbranding=1\`}
              title="YouTube Live Stream"
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none z-10" />
        </div>`;

text = text.replace(oldMobileIframe, newMobileIframe);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient for YouTube');