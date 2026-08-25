const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /kickUsername\?: string;/,
    `kickUsername?: string;
  youtubeLiveId?: string;`
);

// Replace the iframe in SocialVideoFeed
const oldIframe = `          {/* Video Background / Kick Player */}
          {item.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
                <iframe
                  src={\`https://player.kick.com/\${item.kickUsername}?autoplay=true&muted=false\`}
                  className="w-full h-full object-cover transition-transform duration-300 origin-center pointer-events-none"
                  style={{ border: 'none', transform: 'scale(3.16)' }}
                  allow="autoplay; fullscreen"
                  
                />
              </div>
          ) : (`;

const newIframe = `          {/* Video Background / YouTube Player */}
          {item.youtubeLiveId || item.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full aspect-video">
                <iframe
                  src={\`https://www.youtube.com/embed/\${item.youtubeLiveId || item.kickUsername}?autoplay=1&mute=1&rel=0&modestbranding=1\`}
                  title="YouTube Live Stream"
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (`;

text = text.replace(oldIframe, newIframe);

// Remove the pointer-events-none gradient overlay that blocked clicks if any, 
// though the user said "pointer-events-auto solo lo que es clickeable para dejar pasar los toques al video".
// The existing `absolute inset-0 bg-gradient... pointer-events-none z-10` is pointer-events-none, which is fine because it lets clicks pass to the iframe.

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed SocialVideoFeed for YouTube');