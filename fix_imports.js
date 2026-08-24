const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Add Maximize and Minimize to imports if missing
if (!text.includes('Maximize')) {
    text = text.replace(
        /import \{ Heart, MessageCircle, Share2, Plus \} from 'lucide-react'/,
        `import { Heart, MessageCircle, Share2, Plus, Maximize, Minimize } from 'lucide-react'`
    );
}

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed imports');