const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\package.json');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /"build": "prisma generate && prisma db push --accept-data-loss && next build",/,
    '"build": "prisma generate && next build",'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Removed prisma db push from build script');