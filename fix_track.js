const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /chatChannel\.subscribe\(async \(status\) => \{\s*if \(status === 'SUBSCRIBED'\) \{\s*await chatChannel\.track\(\{ online: true \}\)\s*\}\s*\}\)/;

const replacement = `chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            name: user ? userName : 'Espectador Anónimo',
            avatarUrl: user?.avatarUrl || null,
            isAuth: !!user
          })
        }
      })`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');