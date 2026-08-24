const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

text = text.replace(
  /await createKickStream\(title, kickUsername, isAuction, Number\(price\)\)/,
  "const res = await createKickStream(title, kickUsername, isAuction, Number(price))\n        if (res?.error) throw new Error(res.error)"
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed page.tsx');