const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /export default async function Home/,
  "export const dynamic = 'force-dynamic'\n\nexport default async function Home"
);
fs.writeFileSync(file, text, 'utf8');
console.log('Added force-dynamic to page.tsx');