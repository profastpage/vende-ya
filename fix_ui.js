const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

// Fix heart likes
code = code.replace(/<span className="text-xs font-black tabular-nums drop-shadow-lg">\{formatViewers\(likes\)\}<\/span>/, 
  `<span className="text-xs font-black tabular-nums drop-shadow-lg">{formatCompact(likes)}</span>`);

// Prevent overlap
// Let's move the hideUI button further down, e.g., top-36
code = code.replace(/<div className="md:hidden absolute right-3 top-28 z-\[100\] flex flex-col items-end gap-2 \r?\n? *pointer-events-auto">/, 
  `<div className="md:hidden absolute right-3 top-40 z-[100] flex flex-col items-end gap-2 pointer-events-auto">`);

fs.writeFileSync(file, code, 'utf8');