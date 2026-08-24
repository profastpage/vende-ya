const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\mock-data.ts');
let text = fs.readFileSync(filePath, 'utf8');

text = text.replace(/title: '.*Mega subasta de moda.*/g, "title: '🔥 Mega subasta de moda — todo a S/.1 🔥!',");

fs.writeFileSync(filePath, text, 'utf8');