const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Remove the wrong injection
text = text.replace(/  const messagesEndRef = React\.useRef<HTMLDivElement>\(null\);\n  React\.useEffect\(\(\) => \{\n    messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth' \}\);\n  \}, \[chat\]\);\n/, '');

// Inject after chat declaration
text = text.replace(/(const \[chat, setChat\] = useState<ChatMessage\[\]>\(initialChat \|\| \[\]\);)/, `$1\n  const messagesEndRef = React.useRef<HTMLDivElement>(null);\n  React.useEffect(() => {\n    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });\n  }, [chat]);`);

fs.writeFileSync(file, text, 'utf8');