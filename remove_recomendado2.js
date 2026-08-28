const fs = require('fs');
const path = require('path');
const loginPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\login\\page.tsx');
let loginCode = fs.readFileSync(loginPath, 'utf8');

const regex = /<div className="flex items-center justify-between">[\s\S]*?<\/div>/;
loginCode = loginCode.replace(regex, '');

fs.writeFileSync(loginPath, loginCode, 'utf8');