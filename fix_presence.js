const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /const \[viewers\] = React\.useState\(stream\?\.viewerCount \?\? 248\)/,
    'const [viewers, setViewers] = React.useState(stream?.viewerCount ?? 0)'
);

const oldUseEffect = `// Chat Realtime (Always active)
      const chatChannel = supabase.channel(\`chat_\${id}\`)
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          // prevent duplicates if it's our own message bouncing back
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      }).subscribe()`;

const newUseEffect = `// Chat Realtime (Always active)
      const chatChannel = supabase.channel(\`chat_\${id}\`, {
        config: {
          presence: {
            key: 'user_' + Math.random().toString(36).substring(7),
          },
        },
      })
      
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          // prevent duplicates if it's our own message bouncing back
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      })
      
      chatChannel.on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState()
        let count = 0
        for (const key in state) {
          count += state[key].length
        }
        setViewers(count)
      })

      chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({ online: true })
        }
      })`;

text = text.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed viewers real-time presence tracking');