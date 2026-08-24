const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /reporterEmail: string;\r?\n\s*createdAt: string;\r?\n\s*\}>;/,
    `reporterEmail: string;
    createdAt: string;
    infringedBrand: string;
  }>;`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added infringedBrand back to SellerDashboardData');