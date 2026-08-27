const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\actions\\logistics.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/order\.status !== 'SHIPPED'/, `['PENDING', 'PROCESSING', 'SHIPPED'].indexOf(order.status) === -1`);

fs.writeFileSync(file, text, 'utf8');