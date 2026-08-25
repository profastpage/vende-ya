const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /Tu transmisi.n de Kick ha sido enlazada a Vende Ya exitosamente\./,
    `Tu transmisión de YouTube ha sido enlazada a Vende Ya exitosamente.`
);

fs.writeFileSync(file, text, 'utf8');