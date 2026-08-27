const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/db\.sellerWallet\.findUnique\(\{\s*where: \{ userId: sellerId \},/g, `db.wallet.findUnique({\n      where: { userId: sellerId },`);
text = text.replace(/db\.sellerWallet\.create\(\{\s*data: \{\s*userId: sellerId,\s*availableBalance:/g, `db.wallet.create({\n        data: {\n          userId: sellerId,\n          availableBalance:`);

fs.writeFileSync(file, text, 'utf8');