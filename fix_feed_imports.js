const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /import \{ useLiveViewers \} from '@\/hooks\/useLiveViewers'/,
    `import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'`
);

if (!text.includes('useMultiLiveViewers')) {
    text = text.replace(
        /import \{ formatViewers \} from '@\/lib\/vendeda\/format'/,
        `import { formatViewers } from '@/lib/vendeda/format'
import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'`
    );
}

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed SocialVideoFeed imports');