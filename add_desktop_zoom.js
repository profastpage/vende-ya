const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const desktopZoomButton = `
              <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <LiveBadge />
                <ViewersPill viewers={viewers} />
                <button
                  onClick={() => setIsZoomed((v) => !v)}
                  className="mt-2 h-9 px-3 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center hover:bg-muted transition-colors gap-1.5"
                  aria-label="Toggle Zoom"
                >
                  {isZoomed ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  <span className="text-[10px] font-bold uppercase">{isZoomed ? 'Alejar' : 'Acercar'}</span>
                </button>
              </div>
`;

text = text.replace(
    /<div className="flex flex-col items-end gap-2 pointer-events-auto">\r?\n\s*<LiveBadge \/>\r?\n\s*<ViewersPill viewers=\{viewers\} \/>\r?\n\s*<\/div>/,
    desktopZoomButton
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added desktop zoom button');