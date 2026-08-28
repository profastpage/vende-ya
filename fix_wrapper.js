const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<div className="relative" ref=\{spectatorRef\}>/, '<div className="relative flex items-center gap-1" ref={spectatorRef}>');

fs.writeFileSync(file, code, 'utf8');