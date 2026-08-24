const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Top bar \*\/\}\r?\n\s*<div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 gap-2 pointer-events-none">[\s\S]*?<div className="flex flex-col items-end gap-2 pointer-events-auto">\r?\n\s*<LiveBadge \/>\r?\n\s*<ViewersPill viewers=\{viewers\} \/>\r?\n\s*<\/div>\r?\n\s*<\/div>/;

const newTopBar = `{/* Top bar */}
        <div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Volver"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>

          <div className="flex flex-col items-end gap-1.5 pointer-events-auto mt-0.5">
            <LiveBadge />
            <ViewersPill viewers={viewers} />
          </div>
        </div>`;

if (regex.test(text)) {
    text = text.replace(regex, newTopBar);
    console.log('Successfully replaced top bar');
} else {
    console.log('Failed to match top bar regex');
}

fs.writeFileSync(file, text, 'utf8');