const fs = require('fs');
const lines = fs.readFileSync('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx', 'utf8').split('\n');
console.log("Line 457:");
for (let i = 450; i < 465; i++) console.log(`${i + 1}: ${lines[i]}`);
console.log("Line 577:");
for (let i = 570; i < 585; i++) console.log(`${i + 1}: ${lines[i]}`);