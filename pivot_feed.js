const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');

let text = fs.readFileSync(file, 'utf8');

// Ensure we have useRouter imported from next/navigation
if (!text.includes("import { useRouter } from 'next/navigation'")) {
  text = text.replace(/import React from 'react'/, "import React from 'react'\nimport { useRouter } from 'next/navigation'");
}

// Ensure Play icon is imported
if (!text.includes("Play,")) {
  text = text.replace(/Heart, MessageCircle, Share2, Plus, ShoppingBag, Maximize, Minimize/, "Heart, MessageCircle, Share2, Plus, ShoppingBag, Maximize, Minimize, Play");
}

// Modify FeedItem to use useRouter
text = text.replace(/function FeedItem\(\{ item, viewers = 0 \}: \{ item: SocialFeedItem; viewers\?: number \}\) \{/, 
`function FeedItem({ item, viewers = 0 }: { item: SocialFeedItem; viewers?: number }) {
  const router = useRouter();`);

// Replace the iframe logic with the Cover logic
const iframeBlockRegex = /\{\/\* Video Background \/ Kick Player \*\/\}.*?\{\/\* Bottom Info & Product Pin \(Inside Video Container\) \*\/\}/s;

const coverLogic = `{/* Fondo de Portada (Imagen del Producto o Placeholder) */}
        <div 
          className="absolute inset-0 w-full h-full cursor-pointer z-0 group" 
          onClick={() => router.push(\`/en-vivo/\${item.id}\`)}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: \`url(\${item.product?.thumbnail || item.thumbnailUrl || 'https://via.placeholder.com/1080x1920'})\` }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

          {/* Overlay central para invitar a entrar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 rounded-full bg-[#FE2C55] flex items-center justify-center animate-pulse shadow-lg shadow-[#FE2C55]/30 group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-white ml-2" fill="white" />
            </div>
            <span className="text-white font-bold mt-6 drop-shadow-md text-lg tracking-wide uppercase">Toca para entrar al En Vivo</span>
            
            {item.streamProvider && (
              <span className="mt-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-white/90">
                Transmitiendo vía {item.streamProvider}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10" />

        {/* Bottom Info & Product Pin (Inside Video Container) */}`;

text = text.replace(iframeBlockRegex, coverLogic);

// Remove DynamicLivePlayer import since we don't need it in the feed anymore
text = text.replace(/import \{ DynamicLivePlayer \} from '@\/components\/vendeda\/DynamicLivePlayer';\r?\n/, '');

fs.writeFileSync(file, text, 'utf8');