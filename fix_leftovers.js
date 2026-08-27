const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/floatingHearts/g, "floatingEmojis");
text = text.replace(/heart\.id/g, "emoji.id");
text = text.replace(/heart\.left/g, "emoji.left");

// And fix the other TS error about FloatingEmoji
// If there's an unused setFloatingEmojis, maybe there's a leftover snippet pushing a FloatingEmoji?
// Let's just remove the FloatingEmoji interface and any other setFloatingEmojis.
text = text.replace(/interface FloatingEmoji \{[\s\S]*?\}/, "");

fs.writeFileSync(file, text, 'utf8');