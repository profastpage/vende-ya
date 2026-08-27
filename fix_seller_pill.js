const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 border \n*border-amber-300\/40 flex items-center justify-center font-black text-zinc-950 text-xs">\s*\{initial\}\s*<\/div>/;

const replacement = `{seller.avatarUrl ? (
        <img src={seller.avatarUrl} alt={seller.displayName} className="h-7 w-7 rounded-full object-cover border border-amber-300/40" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 border border-amber-300/40 flex items-center justify-center font-black text-white text-xs">
          {initial}
        </div>
      )}`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');