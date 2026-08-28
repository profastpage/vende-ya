const fs = require('fs');
const path = require('path');
const layoutPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\LayoutClientWrapper.tsx');
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

layoutCode = layoutCode.replace(
  /<main className="flex flex-col flex-1 w-full pt-14 md:pt-16 pb-32 md:pb-0 bg-background text-foreground overflow-y-auto overscroll-none">/,
  `{/* Dynamic background: Feed is always black to emulate native apps, other pages respect theme */}\n      <main className={\`flex flex-col flex-1 w-full pt-14 md:pt-16 pb-32 md:pb-0 overflow-y-auto overscroll-none \${pathname === '/' ? 'bg-black text-white' : 'bg-background text-foreground'}\`}>`
);

fs.writeFileSync(layoutPath, layoutCode, 'utf8');