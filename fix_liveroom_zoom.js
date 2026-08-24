const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove desktop zoom button
text = text.replace(
    /<button\r?\n\s*onClick=\{\(\) => setIsZoomed\(\(v\) => \!v\)\}\r?\n\s*className="mt-2 h-9 px-3 rounded-full bg-black\/40 backdrop-blur-xl border border-border flex items-center justify-center hover:bg-muted transition-colors gap-1\.5"\r?\n\s*aria-label="Toggle Zoom"\r?\n\s*>\r?\n\s*\{isZoomed \? <Minimize className="h-4 w-4" \/> : <Maximize className="h-4 w-4" \/>\}\r?\n\s*<span className="text-\[10px\] font-bold uppercase">\{isZoomed \? 'Alejar' : 'Acercar'\}<\/span>\r?\n\s*<\/button>/,
    ''
);

// Remove mobile zoom button
text = text.replace(
    /\{\/\* Zoom \*\/\}\r?\n\s*<button\r?\n\s*onClick=\{\(\) => setIsZoomed\(\(v\) => \!v\)\}\r?\n\s*className="flex flex-col items-center gap-0\.5"\r?\n\s*>\r?\n\s*\{isZoomed \? <Minimize className="h-7 w-7 text-white drop-shadow-lg" \/> : <Maximize className="h-7 w-7 text-white drop-shadow-lg" \/>\}\r?\n\s*<span className="text-\[10px\] font-black text-white drop-shadow">\{isZoomed \? 'Alejar' : 'Acercar'\}<\/span>\r?\n\s*<\/button>/,
    ''
);

// Force scales
text = text.replace(
    /style=\{\{ transform: isZoomed \? 'scale\(1\.25\)' : 'scale\(1\)' \}\}/,
    'style={{ transform: \'scale(1.25)\' }}'
);
text = text.replace(
    /style=\{\{ transform: isZoomed \? 'scale\(3\.16\)' : 'scale\(1\)' \}\}/,
    'style={{ transform: \'scale(3.16)\' }}'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Removed zoom from liveroom');