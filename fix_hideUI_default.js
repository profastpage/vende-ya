const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Default hideUI to true
text = text.replace(
  /const \[hideUI, setHideUI\] = React\.useState\(false\)/,
  "const [hideUI, setHideUI] = React.useState(true)"
);

// 2. Add tooltip next to the Eye button
text = text.replace(
  /<button onClick=\{\(\) => setHideUI\(!hideUI\)\} className="md:hidden absolute right-3 top-1\/2 -translate-y-1\/2 z-\[100\] p-2\.5 bg-black\/80 backdrop-blur-md rounded-full border border-white\/20 text-white shadow-2xl active:scale-90 transition-transform pointer-events-auto" title="Mostrar\/Ocultar Interfaz">\{hideUI \? <Eye className="w-5 h-5" \/> : <EyeOff className="w-5 h-5 text-white\/90" \/>\}<\/button>/,
  `<div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-end gap-2 pointer-events-auto">
            {hideUI && (
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce mr-1">
                💬 Ver Chat y Compras
              </div>
            )}
            <button onClick={() => setHideUI(!hideUI)} className="p-3 bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-white shadow-2xl active:scale-90 transition-transform" title="Mostrar/Ocultar Interfaz">
              {hideUI ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-white/90" />}
            </button>
          </div>`
);

fs.writeFileSync(file, text, 'utf8');