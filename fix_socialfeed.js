const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /className="w-full h-full object-cover transition-transform duration-300 origin-center"/g,
    'className="w-full h-full object-cover transition-transform duration-300 origin-center pointer-events-none"'
);

text = text.replace(
    /style=\{\{ border: 'none', transform: isZoomed \? 'scale\(3\.16\)' : 'scale\(1\)' \}\}/g,
    'style={{ border: \'none\', transform: isZoomed ? \'scale(3.16)\' : \'scale(1.25)\' }}'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed SocialVideoFeed kick iframe');