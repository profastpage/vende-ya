const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const stream = await db\.liveStream\.findFirst\(\{\n\s*where: \{\n\s*seller: \{ username \},\n\s*status: 'live',\n\s*isLive: true\n\s*\},/,
  `const stream = await db.liveStream.findFirst({
    where: { 
      seller: { username },
      status: 'live',
      isLive: true
    },
    orderBy: { createdAt: 'desc' },`
);

fs.writeFileSync(file, text, 'utf8');