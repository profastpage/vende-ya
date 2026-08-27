const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /const initialChatMessages = await db\.liveChatMessage\.findMany\(\{\n\s*where: \{ streamId: stream\.id \},\n\s*orderBy: \{ createdAt: 'asc' \},\n\s*take: 100\n\s*\}\)/,
  `const initialChatMessages = await db.liveChatMessage.findMany({
      where: { streamId: stream.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { sender: true }
    })`
);

text = text.replace(
  /const initialChat = initialChatMessages\.map\(msg => \(\{\n\s*id: msg\.id,\n\s*username: msg\.guestName \|\| 'Usuario',\n\s*text: msg\.content,/,
  `const initialChat = initialChatMessages.map(msg => ({
      id: msg.id,
      username: msg.sender?.displayName || msg.guestName || 'Usuario',
      avatarUrl: msg.sender?.avatarUrl || undefined,
      text: msg.content,`
);

fs.writeFileSync(file, text, 'utf8');