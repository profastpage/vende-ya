const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/return \{ success: false, error: 'Hubo un error en la base de datos al crear tu.*?\. Aseg.*?rate de haber completado tu perfil\.' \}/,
`return { success: false, error: 'Error BD: ' + (error.message || error.toString()) }`);

fs.writeFileSync(file, text, 'utf8');