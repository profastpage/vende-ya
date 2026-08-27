const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /<button onClick=\{handleLike\} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">\s*<Heart[\s\S]*?<\/button>/,
  `<div className="flex items-center shrink-0 gap-1.5 ml-1.5">
                      <button onClick={() => handleLike('❤️')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">❤️</button>
                      <button onClick={() => handleLike('🔥')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">🔥</button>
                      <button onClick={() => handleLike('💸')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">💸</button>
                    </div>`
);

// Fix TS Error 2345: change state definition to the correct type
text = text.replace(
  /const \[floatingEmojis, setFloatingEmojis\] = React\.useState<FloatingEmoji\[\]>\(\[\]\)/,
  "const [floatingEmojis, setFloatingEmojis] = React.useState<{id: number, char: string, left: number}[]>([])"
);

// Also remove floatingHearts state if it's there
text = text.replace(/const \[floatingHearts, setFloatingHearts\] = React\.useState<\{id: number, left: number\}\[\]>\(\[\]\)/, "");

fs.writeFileSync(file, text, 'utf8');