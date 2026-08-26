const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Zona 2: Producto y Pujas \(FIJO\) \*\/\}[\s\S]*?\{\/\* Zona 3: Chat Messages/g;
text = text.replace(regex, "{/* Zona 3: Chat Messages");

fs.writeFileSync(file, text, 'utf8');