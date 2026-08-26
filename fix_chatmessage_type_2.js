const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/interface ChatMessage \{[\s\S]*?isBot\?: boolean\r?\n\}/, `interface ChatMessage {
  id: string
  username: string
  text: string
  color: string
  isBot?: boolean
  avatarUrl?: string | null
}`);

fs.writeFileSync(file, text, 'utf8');