const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Import useLiveViewers and formatViewers
text = text.replace(
    /import \{ Maximize, Minimize, MessageCircle, Heart, Share2, Plus, Volume2, VolumeX, Eye \} from 'lucide-react'/,
    `import { Maximize, Minimize, MessageCircle, Heart, Share2, Plus, Volume2, VolumeX, Eye } from 'lucide-react'
import { useLiveViewers } from '@/hooks/useLiveViewers'
import { formatViewers } from '@/lib/vendeda/format'`
);

// Add hook
text = text.replace(
    /const \[isLiked, setIsLiked\] = useState\(false\)/,
    `const [isLiked, setIsLiked] = useState(false)
  const viewers = useLiveViewers(item.id, 0)`
);

// Add Live Badge + Viewer Pill to top-left of SocialVideoFeed
const overlays = `          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10" />

          {/* Top Left: Live Badge & Viewers */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
            <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> EN VIVO
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black px-2 py-1 rounded-sm flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" /> {formatViewers(viewers).replace(' espectadores', '')}
            </div>
          </div>`;

text = text.replace(
    /<div className="absolute inset-0 bg-gradient-to-b from-black\/20 via-transparent to-black\/80\r?\n\s*pointer-events-none z-10" \/>/,
    overlays
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added Viewers pill to SocialVideoFeed');