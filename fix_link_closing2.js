const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MarketplaceGrid.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<\/div>\r?\n\s*<\/div>\r?\n\s*\)\r?\n\}/, `</div>\n    </Link>\n  )\n}`);

fs.writeFileSync(file, code, 'utf8');