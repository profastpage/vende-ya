const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\types.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /youtubeLiveId\?: string \| null/,
    `youtubeLiveId?: string | null
  streamProvider?: 'TWITCH' | 'KICK' | 'YOUTUBE' | null
  streamProviderId?: string | null`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added provider fields to types');