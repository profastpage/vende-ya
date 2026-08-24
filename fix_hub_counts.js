const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /\{stream\.viewerCount\}/g,
    '{viewers}'
);
text = text.replace(
    /\{formatViewers\(stream\.viewerCount\)\}/g,
    '{formatViewers(viewers)}'
);

// Revert totalViewers back to stream.viewerCount because it's mapping over liveStreams outside the cards!
text = text.replace(
    /const totalViewers = liveStreams\.reduce\(\(sum, s\) => sum \+ viewers, 0\)/,
    'const totalViewers = liveStreams.reduce((sum, s) => sum + s.viewerCount, 0)'
);
text = text.replace(
    /const totalViewers = liveStreams\.reduce\(\(sum, s\) => sum \+ s\.viewers, 0\)/,
    'const totalViewers = liveStreams.reduce((sum, s) => sum + s.viewerCount, 0)'
);

fs.writeFileSync(file, text, 'utf8');
console.log('Replaced viewer counts in Hub');