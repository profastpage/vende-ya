const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /<div className="fixed inset-0 flex w-full h-\[100dvh\] bg-black overflow-hidden text-white z-50 overscroll-none touch-none">/,
  `<div className="fixed inset-0 flex w-full h-[100dvh] bg-black overflow-hidden text-white z-50 overscroll-none">`
);

fs.writeFileSync(file, text, 'utf8');