const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

text = text.replace(
  /bg-purple-950\/20 border border-purple-500\/20/g,
  "bg-zinc-900/50 border border-zinc-800"
);

text = text.replace(
  /text-purple-300 flex items-center/g,
  "text-amber-400 flex items-center"
);

text = text.replace(
  /bg-gradient-to-br from-rose-500\/30 to-rose-700\/30 border-rose-400\/50/g,
  "bg-rose-500/20 border-rose-500/30"
);

fs.writeFileSync(filePath, text, 'utf8');
console.log('Premium colors applied');