const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const newEmoji: FloatingEmoji = \{[\s\S]*?\}/, "const newEmoji = { id: Date.now() + Math.random(), char: emojiChar, left: Math.random() * 60 - 30 }");

fs.writeFileSync(file, text, 'utf8');