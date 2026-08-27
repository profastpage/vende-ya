const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /const userName = user\?\.email\?\.split\('@'\)\[0\] \|\| \(user as any\)\?\.user_metadata\?\.name \|\| 'Usuario';/;
const replacement = `const userName = user?.displayName || 'Usuario';`;
text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');