const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\CheckoutBottomSheet.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/border-border/g, "border-white/10");

fs.writeFileSync(file, text, 'utf8');