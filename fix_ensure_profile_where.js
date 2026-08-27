const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\auth\\ensure-profile\\route.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/where: \{ id: user\.id \}/, `where: { authId: user.id }`);

fs.writeFileSync(file, text, 'utf8');