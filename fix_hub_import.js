const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /import type \{ LiveStream, Profile \} from '@\/lib\/vendeda\/types'/,
    `import type { LiveStream, Profile } from '@/lib/vendeda/types'
import { useLiveViewers } from '@/hooks/useLiveViewers'`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed import');