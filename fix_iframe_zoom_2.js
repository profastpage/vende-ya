const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

const zoomBtn = `
      {/* Zoom Toggle */}
      <button className="flex flex-col items-center gap-1 group" onClick={() => setIsZoomed(!isZoomed)}>
        <div className={\`p-2 rounded-full \${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all\`}>
          {isZoomed ? <Minimize className={\`w-6 h-6 md:w-7 md:h-7 \${isMobile ? 'text-white' : 'text-foreground'}\`} /> : <Maximize className={\`w-6 h-6 md:w-7 md:h-7 \${isMobile ? 'text-white' : 'text-foreground'}\`} />}
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{isZoomed ? 'Alejar' : 'Acercar'}</span>
      </button>
`;

if (!text.includes('Alejar')) {
    text = text.replace(
        /\{\/\* Comments \*\/\}/,
        zoomBtn + '\n\n      {/* Comments */}'
    );
}

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed Zoom Button Injection');