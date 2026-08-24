const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /supabase\.from\('ChatMessage'\)\.select\('\*'\)\.eq\('streamId', id\)\.order\('createdAt', \{ ascending: true \}\)/,
    `supabase.from('LiveChatMessage').select('*').eq('streamId', id).order('createdAt', { ascending: true })`
);

text = text.replace(
    /setChat\(data\.map\(d => \(\{\r?\n\s*id: d\.id,\r?\n\s*username: d\.username,\r?\n\s*text: d\.text,\r?\n\s*color: d\.color \|\| 'text-white',\r?\n\s*isBot: d\.isBot\r?\n\s*\}\)\)\)/,
    `setChat(data.map(d => ({
              id: d.id,
              username: d.guestName || 'Usuario',
              text: d.content,
              color: d.type === 'ai' ? 'text-purple-400' : 'text-white',
              isBot: d.type === 'ai'
            })))`
);

const newInsert = `await supabase.from('LiveChatMessage').insert({
        id: msg.id,
        streamId: id,
        guestName: 'Comprador',
        content: msg.text,
        type: 'user'
      })`;

text = text.replace(
    /await supabase\.from\('ChatMessage'\)\.insert\(\{[\s\S]*?isBot: false\r?\n\s*\}\)/,
    newInsert
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed DB Chat');