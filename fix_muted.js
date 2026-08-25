const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');

let text = fs.readFileSync(file, 'utf8');
text = text.replace(/muted=false/g, 'muted=true');

fs.writeFileSync(file, text, 'utf8');