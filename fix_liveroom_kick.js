const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace desktop iframe
text = text.replace(/<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">[\s\S]*?<iframe[\s\S]*?player\.kick\.com[\s\S]*?\/>/,
`<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <iframe
              src={\`https://www.youtube.com/embed/\${stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'}?autoplay=1&mute=1&rel=0&modestbranding=1\`}
              title="YouTube Live Stream"
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />`);

// Replace mobile iframe
text = text.replace(/<div className="absolute inset-0 z-0">[\s\S]*?<iframe[\s\S]*?player\.kick\.com[\s\S]*?\/>/,
`<div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          <div className="relative w-full aspect-video">
            <iframe
              src={\`https://www.youtube.com/embed/\${stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'}?autoplay=1&mute=1&rel=0&modestbranding=1\`}
              title="YouTube Live Stream"
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>`);

fs.writeFileSync(file, text, 'utf8');