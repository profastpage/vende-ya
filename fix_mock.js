const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\mock-data.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/Kick/g, 'YouTube');
text = text.replace(/kickUsername:/g, 'youtubeLiveId:');

fs.writeFileSync(file, text, 'utf8');