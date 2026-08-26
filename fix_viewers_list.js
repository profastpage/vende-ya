const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Simulated MVP Viewers \*\/\}[\s\S]*?<\/div>\s*<\/motion\.div>/;
const replacement = `{spectators.slice(0, 10).map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {spec.avatar || 'E'}
                  </div>
                  <span className="text-xs font-medium text-white truncate">{spec.name || 'Espectador Anónimo'}</span>
                </div>
              ))}
              {spectators.length > 10 && (
                <div className="px-2 py-1.5 text-xs text-zinc-500 italic">
                  y {spectators.length - 10} más...
                </div>
              )}
            </div>
          </motion.div>`;
text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');