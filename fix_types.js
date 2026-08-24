const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\types.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /playbackId\?: string \| null/g,
    'playbackId?: string | null\n  kickUsername?: string | null'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added kickUsername to LiveStream type');