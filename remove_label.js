const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

const labelRegex = /<label className="flex items-center gap-3 cursor-pointer">[\s\S]*?<\/label>/;
text = text.replace(labelRegex, '');

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Removed label');