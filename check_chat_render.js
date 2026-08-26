const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /Zona 3: Chat Messages[\s\S]*?Zona 4/;
const match = text.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("NOT FOUND");
}