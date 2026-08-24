const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\layout.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/maximumScale: 5,/g, 'maximumScale: 1, userScalable: false,');

fs.writeFileSync(file, text, 'utf8');
console.log('Disabled user zooming in viewport');