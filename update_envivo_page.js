const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/export default async function StreamDetailPage\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/, `export default async function StreamDetailPage({ params }: { params: Promise<{ username: string }> }) {`);
text = text.replace(/const \{ id \} = await params/, `const { username } = await params`);

text = text.replace(/const stream = await db\.liveStream\.findUnique\(\{\s*where: \{ id \},\s*include: \{ seller: true \}\s*\}\)/, `const stream = await db.liveStream.findFirst({
    where: { 
      seller: { username },
      status: 'live',
      isLive: true
    },
    include: { seller: true }
  })`);

// initialChatMessages query
text = text.replace(/const initialChatMessages = await db\.liveChatMessage\.findMany\(\{\s*where: \{ streamId: id \},/, `const initialChatMessages = await db.liveChatMessage.findMany({
    where: { streamId: stream.id },`);
    
// streamId injection
text = text.replace(/id=\{id\}/, `id={stream.id}`);

fs.writeFileSync(file, text, 'utf8');