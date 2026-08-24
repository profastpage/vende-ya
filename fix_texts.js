const fs = require('fs');
const path = require('path');

// 1. Fix en-vivo page text colors
const enVivoPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(enVivoPath, 'utf8');

text = text.replace(
  /<p className="mt-0\.5 text-foreground leading-snug">\{msg\.text\}<\/p>/g,
  '<p className="mt-0.5 text-zinc-100 leading-snug">{msg.text}</p>'
);

text = text.replace(
  /className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none py-1\.5"/g,
  'className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none py-1.5"'
);

text = text.replace(
  /className="hidden md:flex gap-6 max-w-7xl mx-auto p-4 bg-black text-foreground min-h-\[calc\(100vh-4rem\)\]"/g,
  'className="hidden md:flex gap-6 max-w-7xl mx-auto p-4 bg-black text-zinc-100 min-h-[calc(100vh-4rem)]"'
);

text = text.replace(
  /lowTime \? 'text-rose-200' : 'text-foreground'/g,
  "lowTime ? 'text-rose-200' : 'text-white'"
);

text = text.replace(
  /text-foreground font-mono font-black/g,
  "text-white font-mono font-black"
);

fs.writeFileSync(enVivoPath, text, 'utf8');
console.log('Fixed en-vivo text colors');

// 2. Fix corrupted 'sesión' in SocialVideoFeed
const socialFeedPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let feedText = fs.readFileSync(socialFeedPath, 'utf8');
feedText = feedText.replace(/Inicia sesi[^<]+n/g, 'Inicia sesión');
feedText = feedText.replace(/Iniciar sesi[^<]+n/g, 'Iniciar sesión');
fs.writeFileSync(socialFeedPath, feedText, 'utf8');
console.log('Fixed SocialVideoFeed text');
