const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\wallet\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix "Billetera no verificada" pending card
text = text.replace(/bg-amber-400\/10/g, 'bg-amber-100 dark:bg-amber-900/20');
text = text.replace(/text-amber-100/g, 'text-amber-900 dark:text-amber-200');
text = text.replace(/text-amber-200\/80/g, 'text-amber-800 dark:text-amber-200/80');

// 2. Fix KYC required card
text = text.replace(/bg-amber-400\/5/g, 'bg-amber-100 dark:bg-amber-900/20');
text = text.replace(/border-amber-400\/30/g, 'border-amber-300 dark:border-amber-800');
text = text.replace(/text-amber-700 dark:text-amber-300/g, 'text-amber-900 dark:text-amber-300');
text = text.replace(/text-amber-200 underline/g, 'text-amber-900 dark:text-amber-200 underline');

// 3. Fix balance active card
text = text.replace(/text-amber-200\/70/g, 'text-amber-800 dark:text-amber-200/70');

// 4. Fix Commission table
text = text.replace(/bg-black\/30/g, 'bg-muted/50');
text = text.replace(/text-amber-700 dark:text-amber-300/g, 'text-foreground');
text = text.replace(/text-lime-300/g, 'text-foreground');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed styling on wallet/page.tsx');