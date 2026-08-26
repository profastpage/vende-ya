const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\CheckoutBottomSheet.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/\{\['yape', 'plin'\].includes\(paymentMethod\) && \(/g, "{(paymentMethod === 'yape' || paymentMethod === 'plin') && (");

fs.writeFileSync(file, text, 'utf8');