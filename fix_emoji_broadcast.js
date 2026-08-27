const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regexChatChannel = /chatChannel\.on\('broadcast', \{ event: 'new_message' \}, \(payload\) => \{[\s\S]*?\}\)/;

const replacementChatChannel = `chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      })
      
      chatChannel.on('broadcast', { event: 'new_emoji' }, (payload) => {
        const newEmoji = { id: Date.now() + Math.random(), char: payload.payload.char || '❤️', left: Math.random() * 60 - 30 };
        setFloatingEmojis(prev => [...prev, newEmoji]);
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 1500);
      })`;

text = text.replace(regexChatChannel, replacementChatChannel);
fs.writeFileSync(file, text, 'utf8');