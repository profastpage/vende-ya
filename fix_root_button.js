const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<CheckoutBottomSheet/,
  `</div>\n          </div>\n          {/* Ocultar UI Toggle (Solo Mobile) - ROOT LEVEL PARA Z-INDEX ABSOLUTO */}\n          <button onClick={() => setHideUI(!hideUI)} className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[100] p-2.5 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white shadow-2xl active:scale-90 transition-transform pointer-events-auto" title="Mostrar/Ocultar Interfaz">{hideUI ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-white/90" />}</button>\n        </div>\n      <CheckoutBottomSheet`
);

fs.writeFileSync(file, text, 'utf8');