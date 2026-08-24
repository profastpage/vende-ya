const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove the <aside> block entirely
text = text.replace(/<aside[\s\S]*?<\/aside>/, '');

// Fix the iframe to not be pointer-events-none and remove scale-150
text = text.replace(
  /<div className="absolute inset-0 z-0 pointer-events-none">\s*<iframe\s*src=\{`https:\/\/player\.kick\.com\/\$\{item\.kickUsername\}\?autoplay=true&muted=false`\}\s*className="w-full h-full object-cover scale-150"\s*style=\{\{ border: 'none' \}\}\s*allow="autoplay; fullscreen"\s*\/>\s*<\/div>/g,
  `<div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <iframe
                src={\`https://player.kick.com/\${item.kickUsername}?autoplay=true&muted=false\`}
                className="w-full h-[50%] md:h-full object-contain md:object-cover"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed SocialVideoFeed');