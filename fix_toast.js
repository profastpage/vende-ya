const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import Link from 'next\/link'/, `import Link from 'next/link'\nimport { toast } from 'sonner'`);
code = code.replace(/toast\(\{ title: 'Mensaje bloqueado', description: 'Tu mensaje infringi nuestras normas de comunidad.' \}\)/, `toast.error('Mensaje bloqueado', { description: 'Tu mensaje infringi nuestras normas de comunidad.' })`);

fs.writeFileSync(file, code, 'utf8');