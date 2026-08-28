const fs = require('fs');
const path = require('path');
const actionsPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let actionsCode = fs.readFileSync(actionsPath, 'utf8');

actionsCode = actionsCode.replace('Pega una URL correcta de Twitch, Kick o YouTube.', 'El enlace no es válido. Pega una URL correcta de YouTube en vivo.');

// Remove kickUsername assignment
actionsCode = actionsCode.replace(/kickUsername: parsedStream\.provider === 'KICK' \? parsedStream\.id : null,/, '');

fs.writeFileSync(actionsPath, actionsCode, 'utf8');