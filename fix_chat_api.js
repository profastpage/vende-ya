const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\chat\\route.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const \{ streamId, username, text, color, isBot \} = await req\.json\(\)/,
  "const { streamId, username, text, color, isBot, senderId } = await req.json()"
);
text = text.replace(
  /guestName: username,/,
  "guestName: username,\n        senderId: senderId || null,"
);

fs.writeFileSync(file, text, 'utf8');