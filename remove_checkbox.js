const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Remove the state
text = text.replace(/const \[isAuction, setIsAuction\] = React\.useState\(true\)\r?\n?/g, '');

// Remove the checkbox block
const checkboxRegex = /<div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-black\/20">[\s\S]*?<input[\s\S]*?setIsAuction[\s\S]*?<\/div>[\s\S]*?<\/div>/;
text = text.replace(checkboxRegex, '');

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Removed redundant isAuction checkbox');