const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /router\.push\('\/'\)/,
  `router.push('/mi-dashboard') // TODO: Redirigir al nuevo Studio Panel`
);

fs.writeFileSync(file, text, 'utf8');