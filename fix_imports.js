const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/\} Maximize, Minimize,\r?\n\} from 'lucide-react'/, 'Maximize, Minimize,\n} from \'lucide-react\'');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed imports');