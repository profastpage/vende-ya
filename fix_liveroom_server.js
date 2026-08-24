const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/ \|\| MOCK_AUCTION/g, '');
text = text.replace(/const product = auction\.product/g, 'const product = auction?.product || null');
text = text.replace(/import \{ MOCK_AUCTION, MOCK_PROFILES \} from '@\/lib\/vendeda\/mock-data'/, 'import { MOCK_PROFILES } from \'@/lib/vendeda/mock-data\'');

fs.writeFileSync(file, text, 'utf8');
console.log('Removed MOCK_AUCTION from server component');