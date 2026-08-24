const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 gap-2"/g,
    'className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 gap-2 pointer-events-none"'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed mobile top overlay pointer events');