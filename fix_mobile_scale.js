const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /className="w-full h-full object-cover border-none pointer-events-auto scale-\[3\.16\] origin-center"/g,
    'className="w-full h-full border-none pointer-events-auto"'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Removed scale 3.16 from mobile iframe');