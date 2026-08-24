const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /const viewersMap = useMultiLiveViewers\(feed\.map\(f => \(\{ id: f\.id, viewerCount: 0 \}\)\)\), now adapting to light\/dark themes/,
    `const viewersMap = useMultiLiveViewers(feed.map(f => ({ id: f.id, viewerCount: 0 })))
  // now adapting to light/dark themes`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed syntax error');