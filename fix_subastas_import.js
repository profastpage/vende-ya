const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\subastas\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/@\/app\/en-vivo\/\[id\]\/page/, '@/app/en-vivo/[username]/page');
fs.writeFileSync(file, text, 'utf8');