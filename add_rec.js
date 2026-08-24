const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const target = `<li>Descarga la app de Kick en tu celular o usa OBS Studio en PC.</li>`;
const recommendation = `<li>Descarga la app de Kick en tu celular o usa OBS Studio en PC.</li>
                    <li><strong className="text-amber-500">💡 RECOMENDACIÓN:</strong> Transmite siempre en <strong>modo horizontal</strong> para que los compradores vean tu pantalla completa. Si transmites en vertical, Kick añadirá barras negras, pero tus compradores podrán usar el botón "Acercar" para solucionarlo.</li>`;

text = text.replace(target, recommendation);
fs.writeFileSync(file, text, 'utf8');
console.log('Added recommendation to instructions');