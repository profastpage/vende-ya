const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/\{item\.kickUsername \? \([\s\S]*?<div className="absolute inset-0 z-0 flex items-center justify-center bg-black">[\s\S]*?<iframe[\s\S]*?player\.kick\.com[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*\) : \(/,
`{item.youtubeLiveId || item.kickUsername ? (
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
          ) : (`);

fs.writeFileSync(file, text, 'utf8');