const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /const seller = stream\.seller \|\| MOCK_PROFILES\[0\]/,
    `const seller = stream.seller || MOCK_PROFILES[0]

  const initialChatMessages = await db.liveChatMessage.findMany({
    where: { streamId: id },
    orderBy: { createdAt: 'asc' },
    take: 100
  })

  const initialChat = initialChatMessages.map(msg => ({
    id: msg.id,
    username: msg.guestName || 'Usuario',
    text: msg.content,
    color: msg.type === 'ai' ? 'text-purple-400' : 'text-white',
    isBot: msg.type === 'ai'
  }))`
);

text = text.replace(
    /seller=\{seller\} \r?\n\s*\/>/,
    `seller={seller}
      initialChat={initialChat}
    />`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed page.tsx');