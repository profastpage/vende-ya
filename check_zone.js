const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const match = text.match(/{\/\* 2\. ZONA INTERACTIVA[\s\S]*?<\/div>\s*<\/div>\s*<CheckoutBottomSheet/);
if (match) {
  console.log(match[0]);
} else {
  console.log("NOT FOUND");
}