const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{spectators\.length > 10 && \([\s\S]*?mǭs\.\.\.\n\s*<\/div>\n\s*\)\}/;
text = text.replace(regex, '');

fs.writeFileSync(file, text, 'utf8');