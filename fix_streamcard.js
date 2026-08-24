const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /\{\/\* Image \*\/\}\r?\n\s*<div\r?\n\s*className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"\r?\n\s*style=\{\{ backgroundImage: `url\(\$\{stream\.thumbnailUrl \?\? ''\}\)` \}\}\r?\n\s*aria-hidden\r?\n\s*\/>/,
    `{/* Background Media */}
          {stream.kickUsername ? (
            <iframe
              src={\`https://player.kick.com/\${stream.kickUsername}?autoplay=true&muted=true\`}
              className="absolute inset-0 w-full h-full object-cover border-none pointer-events-none origin-center scale-[3.16]"
              allow="autoplay; fullscreen"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: \`url(\${stream.thumbnailUrl ?? ''})\` }}
              aria-hidden
            />
          )}`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed StreamCard kick iframe');