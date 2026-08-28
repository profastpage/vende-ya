const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vendedores\\[username]\\page.tsx');
let code = fs.readFileSync(file, 'utf8');

// Fix the Prisma include error
const target = `      order: {
        include: { items: { include: { product: true } } }
      }`;
const replacement = `      order: true`;
code = code.replace(target, replacement);

fs.writeFileSync(file, code, 'utf8');