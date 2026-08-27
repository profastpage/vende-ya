const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /{\/\* REPRODUCTOR YOUTUBE \*\/}}/g,
  `{/* REPRODUCTOR YOUTUBE */}`
);

text = text.replace(
  /<\/div>\n\s*<CheckoutBottomSheet/,
  `<CheckoutBottomSheet`
);

fs.writeFileSync(file, text, 'utf8');