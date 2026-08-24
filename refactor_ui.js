const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

// 1. ChatMessageBubble
text = text.replace(
  /'bg-muted border-border'/g,
  "'bg-zinc-900/80 border-white/5 text-zinc-100 shadow-sm'"
);

// 2. ChatInputBar
text = text.replace(
  /bg-muted backdrop-blur-xl border border-border/g,
  "bg-zinc-900/80 backdrop-blur-xl border border-white/10"
);
text = text.replace(
  /bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-fuchsia-500\/30/g,
  "bg-amber-400 hover:bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-400/20 transition-colors"
);

// 3. BidPill
text = text.replace(
  /bg-muted hover:bg-amber-400\/15 border border-border hover:border-amber-400\/40/g,
  "bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-amber-400/40"
);

// 4. PujarButton
text = text.replace(
  /bg-gradient-to-r from-amber-400 via-amber-500 to-fuchsia-500/g,
  "bg-amber-400 hover:bg-amber-500"
);
text = text.replace(
  /shadow-xl shadow-amber-500\/30/g,
  "shadow-xl shadow-amber-400/20"
);
text = text.replace(
  /animate=\{\{ boxShadow: \['0 0 20px rgba\(245,158,11,0\.4\)', '0 0 32px rgba\(217,70,239,0\.5\)', '0 0 20px rgba\(245,158,11,0\.4\)'\] \}\}/g,
  "animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.3)', '0 0 32px rgba(251,191,36,0.5)', '0 0 20px rgba(251,191,36,0.3)'] }}"
);

// 5. ComprarYaButton
text = text.replace(
  /bg-transparent border border-white\/15 hover:border-amber-400\/40 text-foreground/g,
  "bg-zinc-900 border border-white/10 hover:border-amber-400/40 text-white shadow-sm"
);

// 6. Fix "Historial de pujas" panel on desktop
text = text.replace(
  /bg-black\/20/g,
  "bg-zinc-950/80"
);

// 7. Fix Countdown Card background (if not lowTime)
text = text.replace(
  /bg-muted border-border/g,
  "bg-zinc-900 border-white/10"
);

fs.writeFileSync(filePath, text, 'utf8');
console.log('UI refactor applied');