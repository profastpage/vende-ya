const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/,\r?\n\s*\}\);\r?\n\r?\n\s*if \(\!wallet\) \{/, '\n\n  if (!wallet) {');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed syntax error in API route');