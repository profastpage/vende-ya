const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const \[viewers, setViewers\] = React\.useState\(stream\?\.viewerCount \?\? 0\)/, `const [spectators, setSpectators] = React.useState<any[]>([])`);

fs.writeFileSync(file, text, 'utf8');