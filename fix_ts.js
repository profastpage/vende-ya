const fs = require('fs');
const path = require('path');

// Fix page.tsx
const pageFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\page.tsx');
let pageText = fs.readFileSync(pageFile, 'utf8');
pageText = pageText.replace(/let streams = \[\]/, 'let streams: any[] = []');
fs.writeFileSync(pageFile, pageText, 'utf8');

// Fix LiveHubClient.tsx
const clientFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let clientText = fs.readFileSync(clientFile, 'utf8');
clientText = clientText.replace(
    /const seller = stream\.seller \|\| \{ displayName: "Usuario", rating: 5, department: "Lima" \}/g,
    'const seller = stream.seller || { id: "0", displayName: "Usuario", rating: 5, department: "Lima", isVerified: false, username: "usuario" }'
);
fs.writeFileSync(clientFile, clientText, 'utf8');

console.log('Fixed TS errors');