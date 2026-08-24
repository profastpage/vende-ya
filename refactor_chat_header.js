const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

text = text.replace(
  /text-xs uppercase tracking-wider text-purple-400/g,
  "text-xs uppercase tracking-wider text-zinc-100"
);

fs.writeFileSync(filePath, text, 'utf8');
console.log('Chat header fixed');