const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix PC UI hiding by making hideUI only affect mobile (using md:opacity-100 and md:pointer-events-auto)
text = text.replace(
  /\${hideUI \? 'opacity-0' : 'opacity-100'}/g,
  "${hideUI ? 'opacity-0 md:opacity-100 md:pointer-events-auto' : 'opacity-100'}"
);

text = text.replace(
  /\${hideUI \? 'pointer-events-none' : 'pointer-events-auto'}/g,
  "${hideUI ? 'pointer-events-none md:pointer-events-auto' : 'pointer-events-auto'}"
);

// 2. Make the root wrapper `fixed inset-0` to lock scrolling and behave like a Native App
text = text.replace(
  /<div className="relative flex w-full h-\[100dvh\] bg-black overflow-hidden text-white">/,
  `<div className="fixed inset-0 flex w-full h-[100dvh] bg-black overflow-hidden text-white z-50 overscroll-none touch-none">`
);

// 3. Move the Eye button to the top right (below the seller header)
text = text.replace(
  /className="md:hidden absolute right-3 top-1\/2 -translate-y-1\/2 z-\[100\] flex flex-col items-end gap-2 pointer-events-auto"/,
  `className="md:hidden absolute right-3 top-20 z-[100] flex flex-col items-end gap-2 pointer-events-auto"`
);

fs.writeFileSync(file, text, 'utf8');