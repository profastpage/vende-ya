const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /const chatChannel = supabase\.channel[\s\S]*?chatChannel\.subscribe\(async \(\status\) => \{[\s\S]*?\}\)/;

const replacement = `const chatChannel = supabase.channel(\`chat_\${id}\`, {
        config: {
          presence: {
            key: user?.id || 'anon_' + Math.random().toString(36).substring(7),
          },
        },
      })
      
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      })
      
      chatChannel.on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState();
        const usersList = Object.values(state).flat();
        setSpectators(usersList);
      })

      chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            id: user?.id || 'anon_' + Math.random().toString(36).substring(7),
            name: user?.displayName || user?.email?.split('@')[0] || 'Espectador Anónimo',
            avatar: user?.avatarUrl || (user?.displayName || user?.email || 'E').charAt(0).toUpperCase()
          });
        }
      })`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');