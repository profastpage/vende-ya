const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar \n*bg-zinc-950\/50">/;
const replacement = `<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar relative z-10" style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}>`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');