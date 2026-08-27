const fs = require('fs');
const lines = fs.readFileSync('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx', 'utf8').split('\n');
for (let i = Math.max(0, 326 - 15); i < Math.min(lines.length, 326 + 15); i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}