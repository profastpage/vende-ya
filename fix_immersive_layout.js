const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Root container
text = text.replace(
  /<div className="flex flex-col md:flex-row w-full h-\[100dvh\] bg-background overflow-hidden text-foreground">/,
  `<div className="relative flex w-full h-[100dvh] bg-black overflow-hidden text-white">`
);

// 2. Video container
text = text.replace(
  /<div className="w-full md:w-2\/3 lg:w-3\/4 h-\[40vh\] md:h-\[100dvh\] shrink-0 bg-black relative flex flex-col border-b md:border-b-0 md:border-r border-white\/5 z-20">/,
  `<div className="absolute inset-0 md:relative md:w-2/3 lg:w-3/4 h-[100dvh] shrink-0 bg-black flex flex-col md:border-r border-white/5 z-0">`
);

// 3. Iframe styling
text = text.replace(
  /<iframe\n\s*src=\{youtubeUrl\}\n\s*className="absolute inset-0 w-full h-full border-none"/,
  `<iframe
                src={youtubeUrl}
                className="absolute inset-0 w-full h-full border-none md:object-contain object-cover scale-[1.01] md:scale-100"`
);

// 4. Chat column wrapper
text = text.replace(
  /<div className="flex-1 md:w-1\/3 lg:w-1\/4 flex flex-col min-h-0 bg-zinc-950 relative z-10 w-full shadow-2xl border-l border-border">/,
  `<div className="absolute inset-0 md:relative md:flex-1 md:w-1/3 lg:w-1/4 flex flex-col justify-end md:justify-start min-h-0 bg-transparent md:bg-zinc-950 z-10 w-full shadow-2xl md:border-l border-border pointer-events-none md:pointer-events-auto">`
);

// 5. Header Vendedor (Desktop) - add pointer-events-auto
text = text.replace(
  /<div className="shrink-0 p-3 border-b border-white\/10 hidden md:flex items-center justify-between bg-zinc-900\/40 backdrop-blur-sm z-10">/,
  `<div className="shrink-0 p-3 border-b border-white/10 hidden md:flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10 pointer-events-auto">`
);

// 6. Header Vendedor (Mobile) - add pointer-events-auto and absolute top
text = text.replace(
  /<div className="shrink-0 p-3 border-b border-white\/10 flex md:hidden items-center justify-between bg-zinc-900\/40 backdrop-blur-sm z-10">/,
  `<div className="absolute top-14 left-0 right-0 p-3 flex md:hidden items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-auto">`
);

// 7. Chat messages area (Zone 3)
text = text.replace(
  /<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar relative z-10" style=\{\{ WebkitMaskImage: 'linear-gradient\(to top, black 80%, transparent 100%\)' \}\}>/,
  `<div className="h-[40vh] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar relative z-10 pointer-events-auto" style={{ WebkitMaskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}>`
);

// 8. Zona 4 (Footer)
text = text.replace(
  /<div className="shrink-0 pt-2 pb-safe bg-gradient-to-t from-black\/80 via-black\/40 to-transparent">/,
  `<div className="shrink-0 pt-2 pb-safe bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">`
);

fs.writeFileSync(file, text, 'utf8');