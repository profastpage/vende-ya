const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/<motion\.span\n\s*key=\{emoji\.id\}[\s\S]*?<\/motion\.span>/g, `<motion.span
                      key={emoji.id}
                      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -150, x: emoji.left, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute text-2xl select-none"
                    >
                      {emoji.char}
                    </motion.span>`);

text = text.replace(/className="absolute bottom-12 right-6 pointer-events-none overflow-visible z-50"/g, 'className="absolute bottom-14 right-14 pointer-events-none overflow-visible z-50"');

fs.writeFileSync(file, text, 'utf8');