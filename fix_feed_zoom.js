const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove zoom toggle button
text = text.replace(
    /\{\/\* Zoom Toggle \*\/\}\r?\n\s*<button className="flex flex-col items-center gap-1 group" onClick=\{\(\) => setIsZoomed\(\!isZoomed\)\}>[\s\S]*?<\/button>/,
    ''
);

// Force zoom scale
text = text.replace(
    /style=\{\{ border: 'none', transform: isZoomed \? 'scale\(3\.16\)' : 'scale\(1\.25\)' \}\}/,
    'style={{ border: \'none\', transform: \'scale(3.16)\' }}'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Removed zoom from feed');