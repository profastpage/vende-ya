const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/seller: \{\s*displayName: stream\.seller\?\.displayName \|\| 'Usuario',\s*avatarUrl: stream\.seller\?\.avatarUrl \|\| undefined,\s*\}/, `seller: {
        username: stream.seller?.username || 'usuario',
        displayName: stream.seller?.displayName || 'Usuario',
        avatarUrl: stream.seller?.avatarUrl || undefined,
      }`);

fs.writeFileSync(file, text, 'utf8');