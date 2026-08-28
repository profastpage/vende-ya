const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {`;
const replacement = `chatChannel.on('broadcast', { event: 'new_product' }, () => {
        router.refresh();
      })
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code, 'utf8');