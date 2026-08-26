const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<div ref=\{messagesEndRef\} \/>/;
const match = text.match(regex);
if (match) {
    // let's print 5 lines before and after it
    const lines = text.split('\n');
    const idx = lines.findIndex(l => l.includes('<div ref={messagesEndRef} />'));
    console.log(lines.slice(Math.max(0, idx - 5), idx + 5).join('\n'));
} else {
    console.log("NOT FOUND");
}