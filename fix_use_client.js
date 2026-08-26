const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove all existing 'use client' directives
text = text.replace(/'use client'[\r\n]*/g, '');
text = text.replace(/"use client"[\r\n]*/g, '');

// Prepend exactly one 'use client' at the very beginning
text = "'use client'\n\n" + text.trimStart();

fs.writeFileSync(file, text, 'utf8');