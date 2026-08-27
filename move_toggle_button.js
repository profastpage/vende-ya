const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove the button from its current location
text = text.replace(
  /{\/\* Ocultar UI Toggle \(Solo Mobile\) \*\/}[\s\S]*?<\/button>\s*?{\/\* REPRODUCTOR YOUTUBE \*\//,
  `{/* REPRODUCTOR YOUTUBE */}`
);

// Add the button to the very end of the root wrapper
text = text.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>\s*\)\s*}\s*$/m,
  `</div>\n          {/* Ocultar UI Toggle (Solo Mobile) - ROOT LEVEL PARA Z-INDEX ABSOLUTO */}\n          <button onClick={() => setHideUI(!hideUI)} className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-[100] p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white shadow-xl active:scale-90 transition-transform pointer-events-auto" title="Mostrar/Ocultar Interfaz">{hideUI ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-white/90" />}</button>\n        </div>\n      </div>\n    </motion.div>\n  )\n}`
);

fs.writeFileSync(file, text, 'utf8');