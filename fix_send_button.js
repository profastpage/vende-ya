const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<button onClick=\{handleLike\} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">\n\s*<Heart className=\{`h-5 w-5 \$\{liked \? 'fill-rose-500 text-rose-500' : 'fill-rose-500 text-rose-500'\}`\} strokeWidth=\{0\} \/>\n\s*<\/button>/;

const replacement = `{chatInput.trim() ? (
                    <button onClick={sendChat} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform text-white">
                      <ChevronRight className="h-6 w-6" strokeWidth={3} />
                    </button>
                  ) : (
                    <button onClick={handleLike} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">
                      <Heart className="h-5 w-5 fill-rose-500 text-rose-500" strokeWidth={0} />
                    </button>
                  )}`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');