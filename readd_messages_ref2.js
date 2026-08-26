const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /(const \[chat, setChat\] = React\.useState<ChatMessage\[\]>\(initialChat \|\| \[\]\))/;
text = text.replace(regex, `$1\n  const messagesEndRef = React.useRef<HTMLDivElement>(null);\n  React.useEffect(() => {\n    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [chat]);`);

fs.writeFileSync(file, text, 'utf8');