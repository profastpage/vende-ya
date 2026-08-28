const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MarketplaceGrid.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<\/div>\r?\n\s*<\/Link>\r?\n\s*\)\r?\n\}/, `</div>\n    </div>\n  )\n}`);

fs.writeFileSync(file, code, 'utf8');