const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

const regex = /<h3 className="font-bold text-foreground">Configura tu transmisi\w+n en vivo<\/h3>[\s\S]*?(?=<form)/;
const match = text.match(regex);
if (match) {
  console.log("MATCH FOUND:");
  console.log(match[0].substring(0, 500)); // print snippet
} else {
  console.log("NOT FOUND");
}