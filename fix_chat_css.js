const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar bg-zinc-950\/50">\s*<div className="flex-1 flex flex-col justify-end">\s*<div className="space-y-3 flex flex-col">/g;

const replacement = `<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar bg-zinc-950/50">
            <div className="mt-auto flex flex-col space-y-3">`;

text = text.replace(regex, replacement);

const regex2 = /<div ref=\{messagesEndRef\} \/>\s*<\/div>\s*<\/div>\s*<\/div>/g;
const replacement2 = `<div ref={messagesEndRef} />
            </div>
          </div>`;
text = text.replace(regex2, replacement2);

fs.writeFileSync(file, text, 'utf8');