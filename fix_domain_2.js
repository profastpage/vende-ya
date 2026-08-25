const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let text = fs.readFileSync(file, 'utf8');

const replacement = `const domainParams = \`parent=localhost&parent=vende-ya-phi.vercel.app\`;`;
text = text.replace(/const domain = process\.env\.NEXT_PUBLIC_DOMAIN \|\| 'vende-ya-phi\.vercel\.app';/g, replacement);

text = text.replace(/parent=\$\{domain\}/g, '${domainParams}');

fs.writeFileSync(file, text, 'utf8');