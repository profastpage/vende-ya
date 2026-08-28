const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<span className="text-xs font-black tabular-nums drop-shadow-lg">\s*\{formatViewers\(viewers\)\}\s*<\/span>\s*<\/button>/,
`<span className="text-xs font-black tabular-nums drop-shadow-lg">
          {formatViewers(viewers)}
        </span>
      </button>
      <div className="inline-flex items-center gap-1 text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer">
        <Heart className="h-3.5 w-3.5 text-[#FE2C55] fill-[#FE2C55]" />
        <span className="text-xs font-black tabular-nums drop-shadow-lg">{formatViewers(likes)}</span>
      </div>`);

fs.writeFileSync(file, code, 'utf8');