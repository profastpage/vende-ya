const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /src=\{\`https:\/\/kick\.com\/\$\{stream\?\.kickUsername \|\| 'gozustrike'\}\`\}/g,
    'src={`https://player.kick.com/${stream?.kickUsername || \'gozustrike\'}?autoplay=true&muted=false`}'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed Kick embed URL');