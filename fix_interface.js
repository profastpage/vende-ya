const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /copyrightReports: Array<\{[\s\S]*?\}>;/,
    `copyrightReports: Array<{
    id: string;
    status: string;
    reporterEmail: string;
    createdAt: string;
  }>;
  notifications: any[];`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added notifications to SellerDashboardData');