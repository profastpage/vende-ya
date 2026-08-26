const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix handleLike
const oldHandleLike = `const handleLike = () => {
    setLiked((v) => !v)
    setLikes((l) => (liked ? Math.max(0, l - 1) : l + 1))
    setBurstKey((k) => k + 1)
  }`;
  
const newHandleLike = `const handleLike = () => {
    setLiked(true);
    setLikes((l) => l + 1); // allow multiple likes
    const newHeart = { id: Date.now(), left: Math.random() * 60 - 30 }; // random X offset
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  }`;

if (text.includes(oldHandleLike)) {
    text = text.replace(oldHandleLike, newHandleLike);
} else {
    // try fallback regex
    text = text.replace(/const handleLike = \(\) => \{[\s\S]*?setBurstKey[\s\S]*?\}/, newHandleLike);
}

// 2. Remove floating hearts from video container
text = text.replace(/\{\/\* Corazones Flotantes \*\/\}[\s\S]*?<\/AnimatePresence>\s*<\/div>/, '');

// 3. Add floating hearts right above the heart button in the footer
const heartButtonRegex = /(<button onClick=\{handleLike\} className="h-12 w-14 rounded-xl bg-white\/5 border border-white\/10 flex items-center justify-center active:scale-95 transition-transform shrink-0">)/;
const heartButtonWithContainer = `<div className="relative">
                 {/* Floating Emojis */}
                 <div className="absolute bottom-12 right-2 pointer-events-none overflow-visible z-50">
                    <AnimatePresence>
                      {floatingHearts.map(heart => (
                        <motion.span
                          key={heart.id}
                          initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                          animate={{ opacity: 0, y: -150, x: heart.left, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute text-2xl select-none"
                        >
                          ❤️
                        </motion.span>
                      ))}
                    </AnimatePresence>
                 </div>
                 $1`;
                 
text = text.replace(heartButtonRegex, heartButtonWithContainer);
text = text.replace(/(<Heart className=\{.*?\} \/>\s*<\/button>)/, `$1\n                 </div>`);

fs.writeFileSync(file, text, 'utf8');