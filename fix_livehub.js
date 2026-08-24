const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace exports and mock imports
text = text.replace(/export default function LivePage\(\) \{/, 'export default function LiveHubClient({ initialStreams }: { initialStreams: any[] }) {');
text = text.replace(/import \{ MOCK_STREAMS, MOCK_PROFILES \} from '@\/lib\/vendeda\/mock-data'\r?\n/, '');

// Replace MOCK_STREAMS with initialStreams
text = text.replace(/MOCK_STREAMS\.filter/g, 'initialStreams.filter');
text = text.replace(/MOCK_STREAMS\[0\]/g, 'initialStreams[0]');

// Also fix seller references in FeaturedHeroCard and StreamCard to not fallback to MOCK_PROFILES
text = text.replace(/const seller: Profile = stream\.seller \?\? MOCK_PROFILES\[0\]/g, 'const seller = stream.seller || { displayName: "Usuario", rating: 5, department: "Lima" }');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveHubClient.tsx');