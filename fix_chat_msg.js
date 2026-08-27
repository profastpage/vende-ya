const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /const msg = \{ id: Date\.now\(\)\.toString\(\), username: 'T.*?', text: chatInput\.trim\(\), color: 'text-lime-400' \}/;
const replacement = `const msg = { id: Date.now().toString(), username: userName || 'Tú', text: chatInput.trim(), color: 'text-lime-400', avatarUrl: user?.avatarUrl }`;
text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');