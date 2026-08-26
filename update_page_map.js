const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/seller: \{\s*displayName: stream\.seller\?.displayName \|\| 'Vendedor',\s*avatarUrl: stream\.seller\?.avatarUrl\s*\}/, `seller: {
        username: stream.seller?.username || 'vendedor',
        displayName: stream.seller?.displayName || 'Vendedor',
        avatarUrl: stream.seller?.avatarUrl
      }`);

fs.writeFileSync(file, text, 'utf8');