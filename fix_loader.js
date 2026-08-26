const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import { Loader2, /, `import { `);
text = text.replace(/import { (ChevronLeft,)/, `import { Loader2, $1`);

fs.writeFileSync(file, text, 'utf8');