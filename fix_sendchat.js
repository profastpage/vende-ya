const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /const sendChat = async \(\) => \{[\s\S]*?await supabase\.channel\(\`chat_\$\{id\}\`\)\.send\(\{[\s\S]*?payload: \{ \.\.\.msg, username: 'Comprador' \}\n\s*\}\)\n\s*\}/;

const replacement = `const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { 
      id: Date.now().toString(), 
      username: userName || 'Tú', 
      text: chatInput.trim(), 
      color: 'text-lime-400', 
      avatarUrl: user?.avatarUrl 
    }
    setChat((prev) => [...prev, msg])
    setChatInput('')

    // Save to DB
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: userName,
          avatarUrl: user?.avatarUrl,
          text: msg.text,
          color: msg.color,
          isBot: false
        })
      })
    } catch(e) {}

    // Broadcast to others
    await supabase.channel(\`chat_\${id}\`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg
    })
  }`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');