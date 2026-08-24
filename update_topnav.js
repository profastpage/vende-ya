const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DesktopTopNav.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /\{ href: ROUTES\.dashboard, label: 'Mi dashboard' \},/,
  "{ href: ROUTES.dashboard, label: 'Mi dashboard' },\n    { href: ROUTES.compras, label: 'Mis compras' },"
);
fs.writeFileSync(file, text, 'utf8');
console.log('Added /compras to top nav');