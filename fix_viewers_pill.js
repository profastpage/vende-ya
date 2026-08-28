const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/function ViewersPill\(\{ realSpectators, anonymousCount \}: \{ realSpectators: any\[\], anonymousCount: number \}\) \{/,
`function ViewersPill({ realSpectators, anonymousCount, likes }: { realSpectators: any[], anonymousCount: number, likes: number }) {`);

code = code.replace(/<ViewersPill realSpectators=\{realSpectators\} anonymousCount=\{anonymousCount\} \/>/g, 
`<ViewersPill realSpectators={realSpectators} anonymousCount={anonymousCount} likes={likes} />`);

// also fix the import of Heart if it's not imported in LiveRoomClient
if(!code.includes('Heart,')) {
    code = code.replace(/import \{/, 'import { Heart,');
}

fs.writeFileSync(file, code, 'utf8');