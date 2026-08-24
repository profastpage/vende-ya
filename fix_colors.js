const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/text-foreground/g, 'text-white');

fs.writeFileSync(file, text, 'utf8');
console.log('Replaced text-foreground with text-white');