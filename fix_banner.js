const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Pequeño Banner Informativo \(Opcional, estilo eBay\) \*\/\}[\s\S]*?<\/div>/;

const replacement = `{/* Pequeño Banner Informativo (estilo eBay) */}
            <div className="px-4 py-1.5 mb-2 mx-3 bg-black/40 backdrop-blur-md rounded-md border border-white/5 flex items-center justify-center">
              <p className="text-[10px] text-white/70 font-medium text-center truncate">
                Vende Ya asegura tu compra hasta la entrega | Envíos a todo el Perú
              </p>
            </div>`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');