const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Update signature
text = text.replace(
    /stream: LiveStream\r?\n\s*auction: any\r?\n\s*product: any\r?\n\s*seller: Profile/,
    `stream: LiveStream
  auction: any
  product: any
  seller: Profile
  initialChat?: ChatMessage[]`
);

// Update useState
text = text.replace(
    /const \[chat, setChat\] = React\.useState<ChatMessage\[\]>\(\[\]\)/,
    `const [chat, setChat] = React.useState<ChatMessage[]>(initialChat || [])`
);

// Remove supabase select
text = text.replace(
    /\/\/ Load historical chat from DB\r?\n\s*supabase\.from\('LiveChatMessage'\)\.select\('\*'\)\.eq\('streamId', id\)\.order\('createdAt', \{ ascending: true \}\)\r?\n\s*\.then\(\(\{ data \}\) => \{[\s\S]*?\}\)\r?\n/,
    ''
);

// Update insert to fetch
const newInsert = `fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: 'Comprador',
          text: msg.text,
          color: msg.color,
          isBot: false
        })
      })`;

text = text.replace(
    /await supabase\.from\('LiveChatMessage'\)\.insert\(\{[\s\S]*?type: 'user'\r?\n\s*\}\)/,
    newInsert
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient chat');