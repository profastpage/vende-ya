const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /export default function LiveRoomClient\(\{ stream, auction, product, seller \}: \{ stream: any, auction: any, product: any, seller: any \}\) \{/,
    `export default function LiveRoomClient({ stream, auction, product, seller, initialChat }: { stream: any, auction: any, product: any, seller: any, initialChat?: ChatMessage[] }) {`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient signature');