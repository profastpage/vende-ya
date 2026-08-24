const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const uniqueLogic = `
  // Filter out any mock/seed streams from the catalog
  streams = streams.filter(s => s.title !== 'Demostración de Kick');

  // Deduplicate streams by sellerId (keep only the most recent one if a seller bugged out and created multiple)
  const uniqueStreams = streams.reduce((acc, current) => {
    const exists = acc.find(stream => stream.sellerId === current.sellerId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  const formattedStreams = uniqueStreams.map(s => ({
    ...s,
    isLive: s.status === 'live' || s.isLive
  }))
`;

text = text.replace(
    /const formattedStreams = streams\.map\(s => \(\{[\s\S]*?isLive: s\.status === 'live' \|\| s\.isLive\r?\n\s*\}\)\)/,
    uniqueLogic
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added unique logic to en-vivo catalog');