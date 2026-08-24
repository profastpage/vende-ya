const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const desktopVideoDiv = /<div\s*className="absolute inset-0 bg-cover bg-center"\s*style=\{\{ backgroundImage: `url\(\$\{thumbnail\}\)` \}\}\s*\/>/;

const desktopIframe = `<iframe
            src={\`https://kick.com/\${stream?.kickUsername || 'gozustrike'}\`}
            className="absolute inset-0 w-full h-full border-none pointer-events-auto"
            allow="autoplay; fullscreen"
          />`;

text = text.replace(desktopVideoDiv, desktopIframe);


const mobileVideoDiv = /<div\s*className="w-full h-full bg-cover bg-center"\s*style=\{\{ backgroundImage: `url\(\$\{thumbnail\}\)` \}\}\s*\/>/;

const mobileIframe = `<iframe
          src={\`https://kick.com/\${stream?.kickUsername || 'gozustrike'}\`}
          className="w-full h-full object-cover border-none pointer-events-auto scale-[3.16] origin-center"
          allow="autoplay; fullscreen"
        />`;

text = text.replace(mobileVideoDiv, mobileIframe);

fs.writeFileSync(file, text, 'utf8');
console.log('Injected iframe into LiveRoomClient');