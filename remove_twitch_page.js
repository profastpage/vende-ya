const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

pageCode = pageCode.replace('Inicia transmisión en tu plataforma favorita (Twitch, Kick o YouTube).', 'Inicia transmisión en vivo desde YouTube.');
pageCode = pageCode.replace('Enlace de tu transmisión (Twitch, Kick o YouTube) *', 'Enlace de tu transmisión de YouTube (Live) *');
pageCode = pageCode.replace('https://twitch.tv/mi_canal', 'Ej. https://youtube.com/live/xxxxxx');

fs.writeFileSync(pagePath, pageCode, 'utf8');