const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove localStorage for Chat
text = text.replace(
    /const \[chat, setChat\] = React\.useState<ChatMessage\[\]>\(\(\) => \{[\s\S]*?\}\)/,
    `const [chat, setChat] = React.useState<ChatMessage[]>([])`
);
text = text.replace(
    /React\.useEffect\(\(\) => \{\r?\n\s*if \(typeof window \!== 'undefined' && chat\.length > 0\) \{[\s\S]*?\}, \[chat, id\]\)/,
    ''
);

// Add DB load and save
const newUseEffect = `// Chat Realtime (Always active)
      const chatChannel = supabase.channel(\`chat_\${id}\`, {
        config: {
          presence: {
            key: 'user_' + Math.random().toString(36).substring(7),
          },
        },
      })
      
      // Load historical chat from DB
      supabase.from('ChatMessage').select('*').eq('streamId', id).order('createdAt', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setChat(data.map(d => ({
              id: d.id,
              username: d.username,
              text: d.text,
              color: d.color || 'text-white',
              isBot: d.isBot
            })))
          }
        })

      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {`;

text = text.replace(
    /\/\/ Chat Realtime \(Always active\)\r?\n\s*const chatChannel = supabase\.channel\(\`chat_\$\{id\}\`, \{\r?\n\s*config: \{\r?\n\s*presence: \{\r?\n\s*key: 'user_' \+ Math\.random\(\)\.toString\(36\)\.substring\(7\),\r?\n\s*\},\r?\n\s*},\r?\n\s*}\)\r?\n\s*chatChannel\.on\('broadcast', \{ event: 'new_message' \}, \(payload\) => \{/,
    newUseEffect
);

const newSendChat = `const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { id: Date.now().toString(), username: 'Tú', text: chatInput.trim(), color: 'text-lime-400' }
    setChat((prev) => [...prev, msg])
    setChatInput('')

    // Save to DB
    try {
      await supabase.from('ChatMessage').insert({
        id: msg.id,
        streamId: id,
        username: 'Comprador',
        text: msg.text,
        color: msg.color,
        isBot: false
      })
    } catch(e) {}

    // Broadcast to others
    await supabase.channel(\`chat_\${id}\`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: { ...msg, username: 'Comprador' }
    })
  }`;

text = text.replace(
    /const sendChat = async \(\) => \{[\s\S]*?payload: \{ \.\.\.msg, username: 'Comprador' \}\r?\n\s*\}\)\r?\n\s*\}/,
    newSendChat
);

fs.writeFileSync(file, text, 'utf8');
console.log('Switched chat to DB persistence');