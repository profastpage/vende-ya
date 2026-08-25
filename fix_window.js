const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import \{ headers \} from 'next\/headers';\n/g, "");
text = text.replace(/export async function/g, "export function");

text = text.replace(/const headersList = await headers\(\);\n.*?const host = headersList\.get\('host'\) \|\| 'localhost';\n.*?const currentDomain = host\.split\(':'\)\[0\];\n.*?const domainParams = `parent=\\$\{currentDomain\}`;/gs,
`const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'vende-ya-phi.vercel.app';
  const domainParams = \`parent=\${currentDomain}\`;`);

fs.writeFileSync(file, text, 'utf8');