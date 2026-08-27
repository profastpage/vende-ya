const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{safeProduct\?\.title \|\| 'Producto en Vivo'\}/;
const replacement = `{safeProduct?.id ? \`#\${safeProduct.id.substring(0,4).toUpperCase()} - \` : ''}{safeProduct?.title || 'Producto en Vivo'}`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');