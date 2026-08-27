const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /<button[\s\S]*?className="md:hidden absolute right-3 top-1\/2 -translate-y-1\/2 z-50 p-2\.5 bg-black\/40 backdrop-blur-md rounded-full border border-white\/20 text-white shadow-lg active:scale-90 transition-transform"[\s\S]*?<\/button>/,
  ""
);

fs.writeFileSync(file, text, 'utf8');