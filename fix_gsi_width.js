const fs = require('fs');
const path = require('path');
const loginPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\login\\page.tsx');
let loginCode = fs.readFileSync(loginPath, 'utf8');

loginCode = loginCode.replace(/width: '100%'/, "width: 320");

fs.writeFileSync(loginPath, loginCode, 'utf8');