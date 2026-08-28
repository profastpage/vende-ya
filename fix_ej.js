const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

pageCode = pageCode.replace('Ej. Ej. https://youtube.com/live/xxxxxx', 'Ej. https://youtube.com/live/xxxxxx');
pageCode = pageCode.replace('Inicia transmisin en tu plataforma favorita (Twitch, Kick o YouTube).', 'Inicia transmisión en vivo desde YouTube.');
pageCode = pageCode.replace('Enlace de tu transmisin (Twitch, Kick o YouTube) *', 'Enlace de tu transmisión de YouTube (Live) *');

fs.writeFileSync(pagePath, pageCode, 'utf8');