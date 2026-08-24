const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Move mobile icons to the middle right
text = text.replace(
    /className="absolute right-3 bottom-40 z-20 flex flex-col gap-4 items-center"/g,
    'className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 items-center"'
);

text = text.replace(
    /className="absolute right-4 bottom-14 z-20 flex flex-col gap-3"/g,
    'className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3"'
);

// Scale mobile iframe to hide black bars
const mobileIframeRegex = /<div className="md:hidden fixed inset-0 z-50 bg-black text-foreground select-none overflow-hidden">[\s\S]*?<div className="absolute inset-0 z-0">[\s\S]*?<iframe[\s\S]*?className="w-full h-full border-none pointer-events-auto"/;

const match = mobileIframeRegex.exec(text);
if (match) {
    const start = match.index;
    const end = start + match[0].length;
    const oldSegment = match[0];
    const newSegment = oldSegment.replace('className="w-full h-full border-none pointer-events-auto"', 'className="w-full h-full border-none pointer-events-auto scale-[3.16] origin-center"');
    text = text.slice(0, start) + newSegment + text.slice(end);
}

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed mobile layout positioning and zooming');