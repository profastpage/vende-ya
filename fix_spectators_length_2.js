const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/\{spectators\.length > 10 && \([\s\S]*?mǭs\.\.\.[\s\S]*?<\/div>\n\s*\)\}/, '');
// If that failed, let's just do a simpler one:
text = text.replace(/\{spectators\.length > 10 && \([\s\S]*?<\/div>\s*\)\}/, '');

fs.writeFileSync(file, text, 'utf8');