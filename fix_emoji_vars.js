const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/floatingEmojis\.map\(heart =>/g, "floatingEmojis.map(emoji =>");
text = text.replace(/const newEmoji: FloatingEmoji = \{\n\s*id: [^\n]*\n\s*char: [^\n]*\n\s*x: [^\n]*\n\s*y: [^\n]*\n\s*\}/g, 
  "const newEmoji = { id: Date.now() + Math.random(), char: emojiChar, left: Math.random() * 60 - 30 }");
text = text.replace(/❤️\n\s*<\/motion\.span>/g, "{emoji.char}\n                    </motion.span>");

fs.writeFileSync(file, text, 'utf8');