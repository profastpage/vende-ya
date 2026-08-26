const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add floating hearts state
if (!text.includes('floatingHearts')) {
  text = text.replace(/(const \[liked, setLiked\] = useState\(false\);)/, `$1
  const [floatingHearts, setFloatingHearts] = useState<{id: number, left: number}[]>([]);
  `);

  // Update handleLike
  const oldHandleLike = /const handleLike = \(\) => \{\n    setLiked\(true\);\n    if \(!liked\) setLikes\(\(l\) => l \+ 1\);\n  \};/;
  const newHandleLike = `const handleLike = () => {
    setLiked(true);
    setLikes((l) => l + 1); // allow multiple likes
    const newHeart = { id: Date.now(), left: Math.random() * 80 + 10 }; // 10% to 90%
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };`;
  text = text.replace(oldHandleLike, newHandleLike);

  // Add the rendering of floating hearts inside the Video column
  // We will place it right inside the Youtube container
  const videoColRegex = /(<div className="flex-1 w-full relative flex items-center justify-center bg-black">)/;
  const heartsRender = `$1
            {/* Corazones Flotantes */}
            <div className="absolute bottom-0 right-10 w-32 h-64 pointer-events-none z-40 overflow-hidden">
              <AnimatePresence>
                {floatingHearts.map(heart => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: 50, x: 0, scale: 0.5 }}
                    animate={{ opacity: 0, y: -200, x: (Math.random() - 0.5) * 50, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute bottom-0"
                    style={{ left: \`\${heart.left}%\` }}
                  >
                    <Heart className="h-8 w-8 fill-rose-500 text-rose-500 drop-shadow-lg" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
`;
  text = text.replace(videoColRegex, heartsRender);
}

fs.writeFileSync(file, text, 'utf8');