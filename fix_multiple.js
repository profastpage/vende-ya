const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const stream = MOCK_STREAMS\.find[\s\S]*?auction\.product\r?\n/, '');
text = text.replace(/const \{ id \} = React\.use\(params\)\r?\n/, '');
text = text.replace(/const router = useRouter\(\)\r?\n/, "const router = useRouter()\n  const id = stream?.id || 'demo'\n");

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed multiple declarations');