const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. handleLike
text = text.replace(
  /const handleLike = \(\) => \{[\s\S]*?\}, 1500\);\s*\}/,
  `const handleLike = (emoji = '❤️') => {
    setLiked(true);
    setLikes(l => l + 1);
    const newEmoji = { id: Date.now(), char: emoji, left: Math.random() * 60 - 30 };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 1500);
    try {
      supabase.channel(\`chat_\${id}\`).send({
        type: 'broadcast',
        event: 'new_emoji',
        payload: { char: emoji }
      });
    } catch(e) {}
  }`
);

// 2. emoji broadcast listener
text = text.replace(
  /chatChannel\.on\('broadcast', \{ event: 'new_message' \}, \(payload\) => \{[\s\S]*?return \[\.\.\.prev, payload\.payload\]\n\s*\}\)\n\s*\}\)/,
  `chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      })
      .on('broadcast', { event: 'new_emoji' }, (payload) => {
        const newEmoji = { id: Date.now() + Math.random(), char: payload.payload.char || '❤️', left: Math.random() * 60 - 30 };
        setFloatingEmojis(prev => [...prev, newEmoji]);
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 1500);
      })`
);

// 3. floatingEmojis in JSX
text = text.replace(
  /\{floatingHearts\.map\(heart => \([\s\S]*?❤️\n\s*<\/motion\.span>\n\s*\)\)\}/,
  `{floatingEmojis.map(emoji => (
                    <motion.span
                      key={emoji.id}
                      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -150, x: emoji.left, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute text-2xl select-none"
                    >
                      {emoji.char}
                    </motion.span>
                  ))}`
);

// 4. Update the Heart button to 3 emojis inside input pill
text = text.replace(
  /<button onClick=\{handleLike\} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">\n\s*<Heart className=\{`h-5 w-5 \$\{liked \? 'fill-rose-500 text-rose-500' : 'text-rose-500'\}`\} strokeWidth=\{0\} \/>\n\s*<\/button>/,
  `<div className="flex items-center shrink-0 gap-1.5 ml-1.5">
                      <button onClick={() => handleLike('❤️')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">❤️</button>
                      <button onClick={() => handleLike('🔥')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">🔥</button>
                      <button onClick={() => handleLike('💸')} className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 active:scale-90 transition-all text-[16px]">💸</button>
                    </div>`
);

// 5. Input length
text = text.replace(
  /<input\n\s*type="text"\n\s*placeholder="Agregar comentario..."/,
  `<input
                    type="text"
                    maxLength={150}
                    placeholder="Agregar comentario..."`
);

// 6. Chat bubble wrap and break-all
text = text.replace(
  /<div className="flex flex-col leading-tight gap-0\.5">\n\s*<span className="font-extrabold text-white\/95 text-\[12px\]">\{msg\.username\}<\/span>\n\s*<span className="text-white text-\[13px\] break-words leading-snug">\{msg\.text\}<\/span>\n\s*<\/div>/,
  `<div className="flex flex-col leading-tight gap-0.5 min-w-0 flex-1">
          <span className="font-extrabold text-white/95 text-[12px] truncate">{msg.username}</span>
          <span className="text-white text-[13px] break-words break-all leading-snug whitespace-normal">{msg.text}</span>
        </div>`
);
text = text.replace(/<div className="flex items-start gap-2">/, '<div className="flex items-start gap-2 w-full max-w-full">');

fs.writeFileSync(file, text, 'utf8');