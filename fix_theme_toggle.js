const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\ThemeToggle.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `'h-9 w-9 rounded-lg flex items-center justify-center transition-all active:scale-90',
        'border border-border',
        'bg-muted hover:bg-accent',
        'text-foreground',`;

const replacement = `'h-9 w-9 flex items-center justify-center transition-all active:scale-90',
        'text-foreground hover:opacity-70',`;

code = code.replace(target, replacement);

// also fix placeholder
code = code.replace(/className="h-9 w-9 rounded-lg bg-muted animate-pulse"/, 'className="h-9 w-9 animate-pulse"');

fs.writeFileSync(file, code, 'utf8');