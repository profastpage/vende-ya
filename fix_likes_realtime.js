const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add imports
text = text.replace(
  /import \{ cn \} from '@\/lib\/utils'/,
  "import { cn } from '@/lib/utils'\nimport { incrementStreamLikes } from './actions'"
);

// 2. Add pendingLikesRef
text = text.replace(
  /const containerRef = React\.useRef<HTMLDivElement>\(null\)/,
  "const containerRef = React.useRef<HTMLDivElement>(null)\n  const pendingLikesRef = React.useRef(0)"
);

// 3. Add debounce interval
text = text.replace(
  /React\.useEffect\(\(\) => \{\n\s*\/\/ Chat Realtime \(Always active\)/,
  `React.useEffect(() => {
    const likeInterval = setInterval(() => {
      if (pendingLikesRef.current > 0) {
        incrementStreamLikes(id, pendingLikesRef.current).catch(console.error);
        pendingLikesRef.current = 0;
      }
    }, 5000);
    return () => clearInterval(likeInterval);
  }, [id]);

  React.useEffect(() => {
    // Chat Realtime (Always active)`
);

// 4. Add new_emoji listener
text = text.replace(
  /chatChannel\.on\('broadcast', \{ event: 'new_message' \}, \(payload\) => \{/,
  `chatChannel.on('broadcast', { event: 'new_emoji' }, (payload) => {
      const char = payload.payload?.char || '❤️';
      setLikes((l) => l + 1);
      const newEmoji = { id: Math.random().toString(), char };
      setFloatingEmojis((prev) => [...prev, newEmoji]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
      }, 1500);
    })
    chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {`
);

// 5. Update handleEmojiTap to accumulate
text = text.replace(
  /const handleEmojiTap = \(emojiChar: string\) => \{/,
  `const handleEmojiTap = (emojiChar: string) => {
    pendingLikesRef.current += 1;`
);

fs.writeFileSync(file, text, 'utf8');