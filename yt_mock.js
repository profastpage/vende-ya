const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\mock-data.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /kickUsername: 'gozustrike',/g,
    `kickUsername: 'gozustrike',
    youtubeLiveId: 'jfKfPfyJRkM',`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added mock youtubeLiveId (lofi girl stream)');