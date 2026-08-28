const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MobileTopActions.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace the transparent logic
const target = `isSocialView 
          ? "bg-transparent border-b border-white/10 backdrop-blur-sm translate-y-0" 
          : cn("bg-background border-b border-border", isVisible ? "translate-y-0" : "-translate-y-full")`;
          
const replacement = `cn("bg-background border-b border-border transition-transform", (!isSocialView && !isVisible) ? "-translate-y-full" : "translate-y-0")`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code, 'utf8');