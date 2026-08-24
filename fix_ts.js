const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/let auctionChannel = null/g, 'let auctionChannel: any = null');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed let auctionChannel type');