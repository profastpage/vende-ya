const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /React\.useEffect\(\(\) => \{\s*\/\/\s*Chat Realtime \([\s\S]*?\n\s*\}, \[auction\?\.id, id, supabase\]\)/;
const match = text.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("NOT FOUND");
}