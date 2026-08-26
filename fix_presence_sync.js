const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /chatChannel\.on\('presence', \{ event: 'sync' \}, \(\) => \{[\s\S]*?setViewers\(count\)[\s\S]*?\}\)/;
const replacement = `chatChannel.on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState();
        const usersList = Object.values(state).flat();
        setSpectators(usersList);
      })`;
text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');