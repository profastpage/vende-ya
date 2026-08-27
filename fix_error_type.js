const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/e\.message/g, `(e instanceof Error ? e.message : String(e))`);

fs.writeFileSync(file, text, 'utf8');