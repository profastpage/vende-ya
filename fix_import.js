const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ formatViewers, formatPEN, timeAgoEs \} from '@\/lib\/vendeda\/format'/, `import { formatViewers, formatCompact, formatPEN, timeAgoEs } from '@/lib/vendeda/format'`);

fs.writeFileSync(file, code, 'utf8');