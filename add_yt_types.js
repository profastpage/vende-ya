const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\types.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /kickUsername\?: string \| null/,
    `kickUsername?: string | null
  youtubeLiveId?: string | null`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added youtubeLiveId to types');