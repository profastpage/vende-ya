const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');
const startIndex = text.indexOf('function DashboardContent');
const endIndex = text.indexOf('function QuickActionsCard') !== -1 ? text.indexOf('function QuickActionsCard') : text.indexOf('/* ================================================================== */', startIndex);
console.log(text.substring(startIndex, endIndex));