const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /<div className="absolute inset-0 bg-gradient-to-b from-black\/40 via-transparent to-black\/80" \/>/g,
    '<div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />'
);

text = text.replace(
    /<div className="absolute inset-0 bg-gradient-to-r from-black\/30 via-transparent to-black\/30" \/>/g,
    '<div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />'
);

text = text.replace(
    /<div className="absolute inset-0 bg-gradient-to-b from-black\/70 via-transparent to-black\/95" \/>/g,
    '<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/95 pointer-events-none" />'
);

text = text.replace(
    /<div className="absolute inset-0 bg-gradient-to-r from-black\/40 via-transparent to-black\/40" \/>/g,
    '<div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added pointer-events-none to gradients');