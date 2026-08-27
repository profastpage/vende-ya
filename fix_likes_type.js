const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add pendingLikesRef
text = text.replace(
  /const messagesEndRef = React\.useRef<HTMLDivElement>\(null\);/,
  `const messagesEndRef = React.useRef<HTMLDivElement>(null);\n  const pendingLikesRef = React.useRef(0);`
);

// 2. Fix the newEmoji creation
text = text.replace(
  /const newEmoji = \{ id: Math\.random\(\)\.toString\(\), char \};/g,
  `const newEmoji = { id: Date.now() + Math.random(), char, left: Math.random() * 60 - 30 };`
);

fs.writeFileSync(file, text, 'utf8');