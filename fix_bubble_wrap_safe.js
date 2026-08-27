const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  '<div className="flex flex-col leading-tight gap-0.5">\r\n          <span className="font-extrabold text-white/95 text-[12px]">{msg.username}</span>\r\n          <span className="text-white text-[13px] break-words leading-snug">{msg.text}</span>\r\n        </div>',
  `<div className="flex flex-col leading-tight gap-0.5 min-w-0 flex-1 overflow-hidden">
          <span className="font-extrabold text-white/95 text-[12px] truncate">{msg.username}</span>
          <span className="text-white text-[13px] break-words break-all leading-snug whitespace-normal">{msg.text}</span>
        </div>`
);

// just in case it's \n instead of \r\n
text = text.replace(
  '<div className="flex flex-col leading-tight gap-0.5">\n          <span className="font-extrabold text-white/95 text-[12px]">{msg.username}</span>\n          <span className="text-white text-[13px] break-words leading-snug">{msg.text}</span>\n        </div>',
  `<div className="flex flex-col leading-tight gap-0.5 min-w-0 flex-1 overflow-hidden">
          <span className="font-extrabold text-white/95 text-[12px] truncate">{msg.username}</span>
          <span className="text-white text-[13px] break-words break-all leading-snug whitespace-normal">{msg.text}</span>
        </div>`
);

fs.writeFileSync(file, text, 'utf8');