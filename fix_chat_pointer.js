const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Change ChatMessageBubble to have pointer-events-auto
text = text.replace(
  /className="text-xs px-2\.5 py-1\.5 rounded-xl backdrop-blur-sm border bg-purple-500\/15 border-purple-400\/30 shadow-lg shadow-purple-500\/10 text-white"/g,
  `className="text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border bg-purple-500/15 border-purple-400/30 shadow-lg shadow-purple-500/10 text-white pointer-events-auto"`
);

text = text.replace(
  /<div className="flex items-start gap-2 w-full max-w-full">/g,
  `<div className="flex items-start gap-2 w-full max-w-full pointer-events-auto">`
);

// 2. Change the Chat wrapper to have pointer-events-none always (except on desktop), and adjust height to 22vh
text = text.replace(
  /className=\{`h-\[28vh\] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 \$\{hideUI \? 'pointer-events-none md:pointer-events-auto' : 'pointer-events-auto'\}`\}/,
  `className={\`h-[22vh] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 pointer-events-none md:pointer-events-auto\`}`
);

fs.writeFileSync(file, text, 'utf8');