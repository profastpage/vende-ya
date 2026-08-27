const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regexEmojiRender = /\{floatingHearts\.map\(heart => \([\s\S]*?❤️\n\s*<\/motion\.span>\n\s*\)\)\}/;

const replacementEmojiRender = `{floatingEmojis.map(emoji => (
                    <motion.span
                      key={emoji.id}
                      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -150, x: emoji.left, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute text-2xl select-none"
                    >
                      {emoji.char}
                    </motion.span>
                  ))}`;

text = text.replace(regexEmojiRender, replacementEmojiRender);
fs.writeFileSync(file, text, 'utf8');