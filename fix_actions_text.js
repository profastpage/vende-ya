const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/por Kick/g, 'por YouTube');
text = text.replace(/streamKey: `kick-\$\{Date.now\(\)\}`/g, 'streamKey: `yt-${Date.now()}`');

fs.writeFileSync(file, text, 'utf8');