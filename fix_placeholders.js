const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  text = text.replace(/https:\/\/via\.placeholder\.com\/1080x1920/g, 'https://placehold.co/1080x1920/1a1a1a/333333.png?text=Live');
  text = text.replace(/https:\/\/via\.placeholder\.com\/150x150/g, 'https://placehold.co/150x150/1a1a1a/333333.png?text=Item');
  text = text.replace(/https:\/\/via\.placeholder\.com\/300x400/g, 'https://placehold.co/300x400/1a1a1a/333333.png?text=Product');
  fs.writeFileSync(filePath, text, 'utf8');
}

replaceInFile(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx'));
replaceInFile(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\marketplace\\page.tsx'));
replaceInFile(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx'));

console.log("Placeholders replaced.");