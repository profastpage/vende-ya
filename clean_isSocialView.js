const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MobileTopActions.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `: isSocialView 
              ? 'bg-black/30 border border-white/20 text-foreground hover:bg-muted/80' 
              : 'bg-accent border border-border text-foreground hover:bg-gray-200'`,
  `: 'bg-accent border border-border text-foreground hover:bg-gray-200'`
);

fs.writeFileSync(file, code, 'utf8');