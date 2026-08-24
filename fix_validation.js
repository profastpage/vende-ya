const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

text = text.replace(
  /if \(\!title \|\| \!price \|\| \!kickUsername\) \{/,
  "if (!title || !price || (isLive && !kickUsername)) {"
);
text = text.replace(
  /incluyendo tu usuario de Kick\./,
  "y si es en vivo, tu usuario de Kick."
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed handleSubmit validation');