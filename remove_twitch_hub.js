const fs = require('fs');
const path = require('path');
const hubPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let hubCode = fs.readFileSync(hubPath, 'utf8');

hubCode = hubCode.replace(/if \(provider === 'TWITCH'\) \{[\s\S]*?if \(provider === 'KICK'\) \{[\s\S]*?if \(provider === 'YOUTUBE'\) \{/, `if (provider === 'YOUTUBE' || provider === 'youtube') {`);

fs.writeFileSync(hubPath, hubCode, 'utf8');