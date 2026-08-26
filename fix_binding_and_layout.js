const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix YouTube ID Data Binding & Fallback + Height Adjustment (2.2 & 2.3)
text = text.replace(/const youtubeUrl = `https:\/\/www\.youtube\.com\/embed\/\$\{stream\?\.streamProviderId \|\| stream\?\.youtubeLiveId \|\| '21X5lGlDOfg'\}\?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0`;/,
`const videoId = stream?.streamProviderId || stream?.youtubeLiveId;
  const isValidYoutubeId = videoId && videoId.length === 11;
  const youtubeUrl = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0\`;`);

text = text.replace(/<div className="w-full h-\[35vh\] md:h-\[50vh\] md:max-h-\[600px\] shrink-0 bg-black relative flex items-center justify-center border-b border-white\/5 shadow-lg z-20">[\s\S]*?<\/div>/,
`<div className="w-full h-[45vh] md:h-[65vh] shrink-0 bg-black relative flex items-center justify-center border-b border-white/5 shadow-lg z-20">
        {isValidYoutubeId ? (
          <iframe
            src={youtubeUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-white/50 bg-zinc-900">
            <svg className="w-12 h-12 mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Transmisión no disponible</p>
            <p className="text-xs text-white/30 mt-1">ID inválido o stream finalizado</p>
          </div>
        )}
        
        {/* Back Button Overlay - Solamente boton de volver encima, YouTube lo permite */}
        <button onClick={() => router.back()} className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors text-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
        {isSeller && (
          <button 
            onClick={handleEndStream}
            disabled={isEnding}
            className="absolute top-4 right-4 z-30 h-10 px-4 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 flex items-center justify-center hover:bg-red-500 transition-colors text-white font-bold text-sm gap-2 disabled:opacity-50"
          >
            <PowerOff className="h-4 w-4" />
            {isEnding ? 'Cerrando...' : 'Finalizar'}
          </button>
        )}
      </div>`);

// 2. Fix NaN in Comprar Ya
text = text.replace(/<button onClick=\{\(\) => setShowCheckout\(true\)\} className="flex-1 h-12 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">[\s\S]*?<\/button>/,
`<button onClick={() => setShowCheckout(true)} className="flex-1 h-12 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                     <ShoppingBag className="h-5 w-5" /> Comprar Ya - {formatPEN(Number(safeProduct?.basePrice) || Number(safeProduct?.price) || 0)}
                   </button>`);

// Also fix Desktop/Mobile container stretch by adding max-w-md mx-auto if user requested a TikTok style pillar for PC.
// Wait, user said: "Asegurar que el contenedor principal en la vista de PC (md:) limite su ancho máximo (ej. max-w-md mx-auto o un grid de 2 columnas)"
// We have: <div className="flex flex-col w-full h-[100dvh] bg-background overflow-hidden text-foreground">
text = text.replace(/<div className="flex flex-col w-full h-\[100dvh\] bg-background overflow-hidden text-foreground">/,
`<div className="flex flex-col w-full max-w-md mx-auto h-[100dvh] md:h-[100vh] bg-background overflow-hidden text-foreground relative md:border-x md:border-white/10 md:shadow-2xl">`);

fs.writeFileSync(file, text, 'utf8');