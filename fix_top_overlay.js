const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /className="absolute top-4 left-4 right-4 flex justify-between items-start gap-3 z-20"/g,
    'className="absolute top-4 left-4 right-4 flex justify-between items-start gap-3 z-20 pointer-events-none"'
);

text = text.replace(
    /className="flex flex-col gap-2"/g,
    'className="flex flex-col gap-2 pointer-events-auto"'
);

text = text.replace(
    /className="flex flex-col items-end gap-2"/g,
    'className="flex flex-col items-end gap-2 pointer-events-auto"'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed top overlay pointer events');