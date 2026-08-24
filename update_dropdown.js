const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DesktopTopNav.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /Mi Dashboard\s*<\/Link>/,
  "Mi Dashboard\n              </Link>\n              <Link\n                href=\"/compras\"\n                onClick={() => setOpen(false)}\n                className=\"flex w-full items-center px-3 py-2 text-xs font-semibold text-gray-700 hover:text-foreground hover:bg-accent rounded-lg transition-colors\"\n              >\n                Mis compras\n              </Link>"
);
fs.writeFileSync(file, text, 'utf8');
console.log('Added /compras to dropdown');