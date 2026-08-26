const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/seller: \{ displayName: string; avatarUrl\?: string \};/, `seller: { username: string; displayName: string; avatarUrl?: string };`);
text = text.replace(/onClick=\{\(\) => router\.push\(\`\/en-vivo\/\$\{item\.id\}\`\)\}/g, `onClick={() => router.push(\`/en-vivo/\${item.seller.username}\`)}`);

fs.writeFileSync(file, text, 'utf8');