const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

text = text.replace(/Tǧ/g, 'Tú');
text = text.replace(/YTO/g, '🔥');
text = text.replace(/s/g, '⚡');
text = text.replace(/Y'o/g, '💖');
text = text.replace(/Y'\?/g, '👏');
text = text.replace(/\?/g, '🌟');
text = text.replace(/Y"/g, '🔥');
text = text.replace(/Y'/g, '🔥');
text = text.replace(/Y-/g, '🚚');
text = text.replace(/S/g, 'Sí');
text = text.replace(/tambiǸn/g, 'también');
text = text.replace(/Perǧ/g, 'Perú');
text = text.replace(/mǭs/g, 'más');
text = text.replace(/Mo!/g, '¡Mío!');
text = text.replace(/Envo/g, 'Envío');
text = text.replace(/instantneo/g, 'instantáneo');

fs.writeFileSync(filePath, text, 'utf8');
console.log('Fixed encoding in en-vivo page');