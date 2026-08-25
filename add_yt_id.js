const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /kickUsername    String\?/,
    `kickUsername    String?
  youtubeLiveId   String?`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added youtubeLiveId to schema');