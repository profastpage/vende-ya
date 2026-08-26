const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/(const \[liked, setLiked\] = React\.useState\(false\))/, `$1
    const [floatingHearts, setFloatingHearts] = React.useState<{id: number, left: number}[]>([])`);

text = text.replace(/const handleLike = \(\) => \{\n    setLiked\(\(v\) => !v\)\n    setLikes\(\(l\) => \(liked \? Math\.max\(0, l - 1\) : l \+ 1\)\)\n    setBurstKey\(\(k\) => k \+ 1\)\n  \}/, `const handleLike = () => {
    setLiked(true);
    setLikes((l) => l + 1); // allow multiple likes
    const newHeart = { id: Date.now(), left: Math.random() * 80 + 10 }; // 10% to 90%
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  }`);

fs.writeFileSync(file, text, 'utf8');