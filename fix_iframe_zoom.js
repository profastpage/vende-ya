const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Add state for zoom
if (!text.includes('const [isZoomed, setIsZoomed]')) {
    text = text.replace(
        'const [isLiked, setIsLiked] = React.useState(false)',
        'const [isLiked, setIsLiked] = React.useState(false)\n  const [isZoomed, setIsZoomed] = React.useState(false)'
    );
}

// Add the zoom style to the iframe
text = text.replace(
    /className="w-full h-full object-cover"[\s\S]*?style=\{\{ border: 'none' \}\}/,
    `className="w-full h-full object-cover transition-transform duration-300 origin-center"\n                style={{ border: 'none', transform: isZoomed ? 'scale(3.16)' : 'scale(1)' }}`
);

// Add Maximize icon import if needed
if (!text.includes('Maximize')) {
    text = text.replace(
        /import \{ Heart, MessageCircle, Share2, Plus \} from 'lucide-react'/,
        `import { Heart, MessageCircle, Share2, Plus, Maximize, Minimize } from 'lucide-react'`
    );
}

// Pass isZoomed to InteractionButtons
text = text.replace(
    /<InteractionButtons item=\{item\} isLiked=\{isLiked\} setIsLiked=\{setIsLiked\} isMobile=\{true\} \/>/,
    `<InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={true} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />`
);
text = text.replace(
    /<InteractionButtons item=\{item\} isLiked=\{isLiked\} setIsLiked=\{setIsLiked\} isMobile=\{false\} \/>/,
    `<InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={false} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />`
);

// Update InteractionButtons signature
text = text.replace(
    /function InteractionButtons\(\{ item, isLiked, setIsLiked, isMobile \}: \{ item: SocialFeedItem, isLiked: boolean, setIsLiked: \(v: boolean\) => void, isMobile: boolean \}\) \{/,
    `function InteractionButtons({ item, isLiked, setIsLiked, isMobile, isZoomed, setIsZoomed }: { item: SocialFeedItem, isLiked: boolean, setIsLiked: (v: boolean) => void, isMobile: boolean, isZoomed: boolean, setIsZoomed: (v: boolean) => void }) {`
);

// Add the Zoom toggle button to InteractionButtons
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
        /\{ \/\* Comments \*\/ \}/,
        zoomBtn + '\n\n      {/* Comments */}'
    );
}

fs.writeFileSync(file, text, 'utf8');
console.log('Added Zoom Toggle successfully');