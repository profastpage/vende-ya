const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /const \[chat, setChat\] = useState<ChatMessage\[\]>\(initialChat || \[\]\);/;
if (text.match(regex)) {
    console.log("FOUND");
} else {
    console.log("NOT FOUND");
}