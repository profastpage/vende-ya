const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const parsedStream = parseStreamUrl\(streamUrl\);/, 'const parsedStream = await parseStreamUrl(streamUrl);');
fs.writeFileSync(file, text, 'utf8');