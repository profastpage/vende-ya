const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Move Eye button further down to avoid overlapping the EN VIVO badge
text = text.replace(
  /className="md:hidden absolute right-3 top-20 z-\[100\] flex flex-col items-end gap-2 pointer-events-auto"/g,
  `className="md:hidden absolute right-3 top-28 z-[100] flex flex-col items-end gap-2 pointer-events-auto"`
);

// 2. Reduce chat height to make it less invasive
text = text.replace(
  /className=\{`h-\[35vh\]/g,
  `className={\`h-[28vh]`
);

fs.writeFileSync(file, text, 'utf8');