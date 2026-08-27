const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add hideUI state and Eye/EyeOff icons import
if (!text.includes('EyeOff')) {
  text = text.replace(
    /import { ChevronLeft, ChevronRight, Share2, Users, Loader2, PowerOff } from 'lucide-react'/,
    "import { ChevronLeft, ChevronRight, Share2, Users, Loader2, PowerOff, Eye, EyeOff } from 'lucide-react'"
  );
}

text = text.replace(
  /const \[hasParticipated, setHasParticipated\] = React\.useState\(false\)/,
  "const [hasParticipated, setHasParticipated] = React.useState(false)\n    const [hideUI, setHideUI] = React.useState(false)"
);

// 2. Add the hideUI class to the right column (UI layer)
text = text.replace(
  /<div className="absolute inset-0 md:relative md:flex-1 md:w-1\/3 lg:w-1\/4 flex flex-col justify-end md:justify-start min-h-0 bg-transparent md:bg-zinc-950 z-10 w-full shadow-2xl md:border-l border-border pointer-events-none md:pointer-events-auto">/,
  `<div className={\`absolute inset-0 md:relative md:flex-1 md:w-1/3 lg:w-1/4 flex flex-col justify-end md:justify-start min-h-0 bg-transparent md:bg-zinc-950 z-10 w-full shadow-2xl md:border-l border-border pointer-events-none md:pointer-events-auto transition-opacity duration-300 \${hideUI ? 'opacity-0' : 'opacity-100'}\`}>`
);

// 3. Prevent pointer events on the UI layer when hidden so clicks go through to YouTube
text = text.replace(
  /<div className="h-\[35vh\] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 pointer-events-auto"/,
  `<div className={\`h-[35vh] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 \${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}\`}`
);

text = text.replace(
  /<div className="shrink-0 pt-2 pb-safe bg-gradient-to-t from-black\/80 via-black\/40 to-transparent pointer-events-auto">/,
  `<div className={\`shrink-0 pt-2 pb-safe bg-gradient-to-t from-black/80 via-black/40 to-transparent \${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}\`}>`
);

text = text.replace(
  /<div className="absolute top-14 left-0 right-0 p-3 flex md:hidden items-center justify-between bg-gradient-to-b from-black\/60 to-transparent z-10 pointer-events-auto">/,
  `<div className={\`absolute top-14 left-0 right-0 p-3 flex md:hidden items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10 \${hideUI ? 'pointer-events-none' : 'pointer-events-auto'}\`}>`
);

// 4. Add the toggle button floating on the right side
text = text.replace(
  /{\/\* REPRODUCTOR YOUTUBE \*\//,
  `{/* Ocultar UI Toggle (Solo Mobile) */}
            <button 
              onClick={() => setHideUI(!hideUI)}
              className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-50 p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white shadow-lg active:scale-90 transition-transform"
              title="Mostrar/Ocultar Interfaz"
            >
              {hideUI ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-white/70" />}
            </button>
  
            {/* REPRODUCTOR YOUTUBE */}`
);

fs.writeFileSync(file, text, 'utf8');