const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes("import { useMultiLiveViewers }")) {
    text = `import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'\n` + text;
}

fs.writeFileSync(file, text, 'utf8');
console.log('Forced import');