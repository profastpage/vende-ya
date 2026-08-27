const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regexChatInput = /<button onClick=\{handleLike\} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">\n\s*<Heart className=\{`h-5 w-5 \$\{liked \? 'fill-rose-500 text-rose-500' : 'text-rose-500'\}`\} strokeWidth=\{0\} \/>\n\s*<\/button>/;

const replacementChatInput = `<div className="flex items-center shrink-0 gap-1.5 ml-1.5">
                      <button onClick={() => handleLike('❤️')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">❤️</button>
                      <button onClick={() => handleLike('🔥')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">🔥</button>
                      <button onClick={() => handleLike('💸')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">💸</button>
                    </div>`;

text = text.replace(regexChatInput, replacementChatInput);

// Also add maxLength to input
const regexInput = /<input\n\s*type="text"\n\s*placeholder="Agregar comentario..."/;
const replacementInput = `<input
                    type="text"
                    maxLength={150}
                    placeholder="Agregar comentario..."`;
text = text.replace(regexInput, replacementInput);

fs.writeFileSync(file, text, 'utf8');