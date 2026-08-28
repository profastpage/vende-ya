const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MobileTopActions.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `: 'bg-muted border border-border text-foreground hover:bg-accent'`;
const replacement = `: 'text-foreground hover:opacity-70'`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code, 'utf8');