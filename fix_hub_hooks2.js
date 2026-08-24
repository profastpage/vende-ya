const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /function FeaturedHeroCard\(\{ stream \}: \{ stream: LiveStream \}\) \{\r?\n\s*const seller = stream\.seller/g,
    `function FeaturedHeroCard({ stream }: { stream: LiveStream }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)
  const seller = stream.seller`
);

text = text.replace(
    /function StreamCard\(\{ stream \}: \{ stream: LiveStream \}\) \{\r?\n\s*const seller = stream\.seller/g,
    `function StreamCard({ stream }: { stream: LiveStream }) {
  const viewers = useLiveViewers(stream.id, stream.viewerCount)
  const seller = stream.seller`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed hooks in Hub');