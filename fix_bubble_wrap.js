const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regexBubble = /<div className="flex flex-col leading-tight gap-0\.5">\n\s*<span className="font-extrabold text-white\/95 text-\[12px\]">\{msg\.username\}<\/span>\n\s*<span className="text-white text-\[13px\] break-words leading-snug">\{msg\.text\}<\/span>\n\s*<\/div>/;

const replacementBubble = `<div className="flex flex-col leading-tight gap-0.5 min-w-0 flex-1">
          <span className="font-extrabold text-white/95 text-[12px] truncate">{msg.username}</span>
          <span className="text-white text-[13px] break-words break-all leading-snug whitespace-normal">{msg.text}</span>
        </div>`;

text = text.replace(regexBubble, replacementBubble);

// And we must ensure the parent div has flex-1 or w-full so it takes the remaining width and min-w-0
text = text.replace(/<div className="flex items-start gap-2">/, '<div className="flex items-start gap-2 w-full max-w-full">');

fs.writeFileSync(file, text, 'utf8');