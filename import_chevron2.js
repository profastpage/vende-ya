const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes("ChevronRight,")) {
  text = text.replace(/ChevronLeft,/, "ChevronLeft, ChevronRight,");
}
fs.writeFileSync(file, text, 'utf8');