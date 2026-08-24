const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\routes.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/dashboard: '\/dashboard',/, "dashboard: '/dashboard',\n  compras: '/compras',");
fs.writeFileSync(file, text, 'utf8');
console.log('Added /compras to routes');