const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\productos\\[id]\\ProductDetailsClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const related = \[\]/g, `const related: any[] = []`);

fs.writeFileSync(file, code, 'utf8');