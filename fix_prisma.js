const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/  chatMessages    ChatMessage\[\]\r?\n/, '');

// Remove ChatMessage model entirely
text = text.replace(/\/\/ ---------------------------------------------------------------------\r?\n\/\/ CHAT MESSAGES\r?\n\/\/ ---------------------------------------------------------------------\r?\nmodel ChatMessage \{[\s\S]*?\}\r?\n/, '');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed Prisma Schema');