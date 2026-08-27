const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const handleLike = \(emoji = '❤️'\) => \{/,
  `const handleLike = (emoji = '❤️') => {
    pendingLikesRef.current += 1;`
);

fs.writeFileSync(file, text, 'utf8');