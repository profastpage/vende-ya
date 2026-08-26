const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex-1 flex flex-col justify-end">\s*<div className="space-y-3 flex flex-col-reverse">\s*\{\[\.\.\.chat\]\.reverse\(\)\.map\(\(msg\) => \(\s*<ChatMessageBubble key=\{msg\.id\} msg=\{msg\} \/>\s*\)\)\}\s*<\/div>\s*<\/div>/;

const replacement = `<div className="flex-1 flex flex-col justify-end">
              <div className="space-y-3 flex flex-col">
                {chat.map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');