const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Update handleLike
const regexHandleLike = /const handleLike = \(\) => \{\s*setLiked\(true\);\s*setLikes\(\(l\) => l \+ 1\);\s*\/\/ allow multiple likes\s*const newHeart = \{ id: Date\.now\(\), left: Math\.random\(\) \* 60 - 30 \};\s*\/\/ random X offset\s*setFloatingHearts\(prev => \[\.\.\.prev, newHeart\]\);\s*setTimeout\(\(\) => \{\s*setFloatingHearts\(prev => prev\.filter\(h => h\.id !== newHeart\.id\)\);\s*\}, 1500\);\s*\}/;

const replacementHandleLike = `const handleLike = (emoji = '❤️') => {
    const newEmoji = { id: Date.now(), char: emoji, left: Math.random() * 60 - 30 };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 1500);
    // Broadcast emoji
    try {
      supabase.channel(\`chat_\${id}\`).send({
        type: 'broadcast',
        event: 'new_emoji',
        payload: { char: emoji }
      });
    } catch(e) {}
  }`;

text = text.replace(regexHandleLike, replacementHandleLike);

fs.writeFileSync(file, text, 'utf8');