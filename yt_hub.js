const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const oldHeroIframe = `{stream.kickUsername ? (
          <iframe
            src={\`https://player.kick.com/\${stream.kickUsername}?autoplay=true&muted=true\`}
            className="absolute inset-0 w-full h-full border-none pointer-events-none"
            allow="autoplay; fullscreen"
          />
        ) : (`;

const newHeroIframe = `{stream.youtubeLiveId || stream.kickUsername ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <div className="relative w-full aspect-video pointer-events-none">
              <iframe
                src={\`https://www.youtube.com/embed/\${stream.youtubeLiveId || stream.kickUsername}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0\`}
                className="absolute top-0 left-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        ) : (`;

text = text.replace(oldHeroIframe, newHeroIframe);

const oldCardIframe = `{stream.kickUsername ? (
            <iframe
              src={\`https://player.kick.com/\${stream.kickUsername}?autoplay=true&muted=true\`}
              className="absolute inset-0 w-full h-full object-cover border-none pointer-events-none origin-center scale-[3.16]"
              allow="autoplay; fullscreen"
            />
          ) : (`;

const newCardIframe = `{stream.youtubeLiveId || stream.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full aspect-video pointer-events-none">
                <iframe
                  src={\`https://www.youtube.com/embed/\${stream.youtubeLiveId || stream.kickUsername}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0\`}
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          ) : (`;

text = text.replace(oldCardIframe, newCardIframe);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveHubClient for YouTube');