const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /className="w-full h-\[50%\] md:h-full object-contain md:object-cover"/g,
  `className="w-full h-full object-cover"`
);

text = text.replace(
  /allowFullScreen/g,
  ""
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed iframe sizing to h-full for mobile');