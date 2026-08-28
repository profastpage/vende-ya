const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/router\.push\('\/mi-dashboard'\) \/\/ TODO: Redirigir al nuevo Studio Panel/, `router.push('/studio')`);

fs.writeFileSync(file, code, 'utf8');