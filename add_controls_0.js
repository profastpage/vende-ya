const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const youtubeUrl = \`https:\/\/www\.youtube\.com\/embed\/\$\{videoId\}\?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0\`/, `const youtubeUrl = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0&controls=0\``);

fs.writeFileSync(file, text, 'utf8');