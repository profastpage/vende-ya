const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Add Maximize/Minimize icons
text = text.replace(
    /from 'lucide-react'/,
    'Maximize, Minimize,\n} from \'lucide-react\''
);

// Add isZoomed state
text = text.replace(
    /const \[liked, setLiked\] = React\.useState\(false\)/,
    'const [liked, setLiked] = React.useState(false)\n  const [isZoomed, setIsZoomed] = React.useState(true)'
);

// Desktop iframe scale
text = text.replace(
    /className="absolute inset-0 w-full h-full border-none pointer-events-auto"/g,
    'className="absolute inset-0 w-full h-full border-none pointer-events-none origin-center" style={{ transform: isZoomed ? \'scale(1.25)\' : \'scale(1)\' }}'
);

// Mobile iframe scale (dynamic)
text = text.replace(
    /className="w-full h-full border-none pointer-events-auto scale-\[3\.16\] origin-center"/g,
    'className="w-full h-full border-none pointer-events-none origin-center transition-transform duration-300" style={{ transform: isZoomed ? \'scale(3.16)\' : \'scale(1)\' }}'
);

// Add Zoom button to Mobile Layout right-side buttons (above Chat)
const zoomButton = `
        {/* Zoom */}
        <button
          onClick={() => setIsZoomed((v) => !v)}
          className="flex flex-col items-center gap-0.5"
        >
          {isZoomed ? <Minimize className="h-7 w-7 text-foreground drop-shadow-lg" /> : <Maximize className="h-7 w-7 text-foreground drop-shadow-lg" />}
          <span className="text-[10px] font-black text-foreground drop-shadow">{isZoomed ? 'Alejar' : 'Acercar'}</span>
        </button>
`;

text = text.replace(
    /\{\/\* Chat \*\/\}/,
    zoomButton + '\n        {/* Chat */}'
);

// Also add Zoom button to Desktop layout right side icons? Actually Desktop doesn't have right-side floating icons inside the video player. But wait, I'll leave Desktop without a button, it just defaults to 1.25. Actually they said "solo dejamos para agrandar la imagen a video completo". It's fine if desktop is fixed. Wait, if desktop is fixed, they might want to unmute it! Let's put a zoom button on desktop too! Or just let it be. They can use the space.

fs.writeFileSync(file, text, 'utf8');
console.log('Added isZoomed toggle and scaling logic');