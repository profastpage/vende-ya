const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Update imports
if (!text.includes('endLiveStream')) {
  text = text.replace(/import \{ ChevronLeft/, "import { endLiveStream } from '@/app/vender/actions'\nimport { ChevronLeft");
}
if (!text.includes('PowerOff')) {
  text = text.replace(/ChevronLeft,/, "PowerOff, ChevronLeft,");
}
if (!text.includes('useTransition')) {
  text = text.replace(/useState, useEffect/, "useState, useEffect, useTransition");
}

// Update props
text = text.replace(/export default function LiveRoomClient\(\{ stream, auction, product, seller, initialChat \}: \{ stream: any, auction: any, product: any, seller: any, initialChat\?: ChatMessage\[\] \}\) \{/,
`export default function LiveRoomClient({ stream, auction, product, seller, initialChat, currentUserId }: { stream: any, auction: any, product: any, seller: any, initialChat?: ChatMessage[], currentUserId?: string }) {
  const [isEnding, startEnding] = useTransition();
  const isSeller = currentUserId === seller.id;

  const handleEndStream = () => {
    startEnding(async () => {
      try {
        await endLiveStream(stream.id);
        router.push('/');
      } catch(e) {
        console.error(e);
      }
    });
  };
`);

// Add the button next to "Volver"
text = text.replace(/<button onClick=\{\(\) => router\.back\(\)\} className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full bg-black\/50 backdrop-blur-md border border-white\/10 flex items-center justify-center hover:bg-black\/70 transition-colors text-white">\s*<ChevronLeft className="h-6 w-6" \/>\s*<\/button>/,
`<button onClick={() => router.back()} className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors text-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
        {isSeller && (
          <button 
            onClick={handleEndStream}
            disabled={isEnding}
            className="absolute top-4 right-4 z-30 h-10 px-4 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 flex items-center justify-center hover:bg-red-500 transition-colors text-white font-bold text-sm gap-2 disabled:opacity-50"
          >
            <PowerOff className="h-4 w-4" />
            {isEnding ? 'Cerrando...' : 'Finalizar Transmisión'}
          </button>
        )}`);

fs.writeFileSync(file, text, 'utf8');