const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\checkout\\route.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/source,\s*totalAmount/m, `source,\n        productId,\n        totalAmount`);

fs.writeFileSync(file, code, 'utf8');