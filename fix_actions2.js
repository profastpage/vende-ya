const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/streamProviderId: parsedStream\.id(\r?\n)/,
`streamProviderId: parsedStream.id,
        thumbnailUrl: coverImage || null$1`);

fs.writeFileSync(file, code, 'utf8');