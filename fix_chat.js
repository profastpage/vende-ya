const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetSendChat = `  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { id: Date.now().toString(), username: userName || 'T', text: chatInput.trim(), color: 'text-lime-400', avatarUrl: user?.avatarUrl }
    setChat((prev) => [...prev, msg])
    setChatInput('')

    // Save to DB
    try {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: msg.username,
          text: msg.text,
          color: msg.color,
          senderId: user?.id
        })
      })
    } catch(e) {}

    // Broadcast to others
    await supabase.channel(\`chat_\${id}\`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: { ...msg, username: 'Comprador' }
    })
  }`;

const replacementSendChat = `  const sendChat = async () => {
    if (!chatInput.trim()) return
    const currentText = chatInput.trim()
    const msg = { id: Date.now().toString(), username: userName || 'T', text: currentText, color: 'text-lime-400', avatarUrl: user?.avatarUrl }
    setChat((prev) => [...prev, msg])
    setChatInput('')

    // Moderate and Save to DB
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: id,
          username: msg.username,
          text: msg.text,
          color: msg.color,
          senderId: user?.id
        })
      })
      const data = await res.json()
      
      if (data.flagged) {
        setChat(prev => prev.map(m => m.id === msg.id ? { ...m, text: '[Mensaje bloqueado por la IA de Moderacin]', color: 'text-rose-500' } : m));
        toast({ title: 'Mensaje bloqueado', description: 'Tu mensaje infringi nuestras normas de comunidad.' })
        return; // No broadcast
      }
    } catch(e) {}

    // Broadcast to others
    await supabase.channel(\`chat_\${id}\`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: { ...msg, username: userName || 'Espectador' }
    })
  }`;

code = code.replace(/const sendChat = async \(\) => \{[\s\S]*?payload: \{ \.\.\.msg, username: 'Comprador' \}\r?\n\s*\}\)\r?\n\s*\}/, replacementSendChat);
fs.writeFileSync(file, code, 'utf8');