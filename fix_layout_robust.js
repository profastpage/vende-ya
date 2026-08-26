const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const searchStr = '  return (\n      <>\n        <div className="flex flex-col';
const returnStart = text.indexOf('  return (\n      <>\n        <div className="flex flex-col');
if (returnStart === -1) {
    console.error("RETURN START NOT FOUND. Let's try regex.");
}

const checkoutStart = text.indexOf('<CheckoutBottomSheet');
if (checkoutStart === -1) {
    console.error("CHECKOUT START NOT FOUND");
    process.exit(1);
}

const newLayout = `  return (
    <>
      <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-background overflow-hidden text-foreground">
        
        {/* ========================================================
            COLUMNA IZQUIERDA: VIDEO (PC) / ARRIBA (MOBILE)
            ======================================================== */}
        <div className="w-full md:w-2/3 lg:w-3/4 h-[40vh] md:h-[100dvh] shrink-0 bg-black relative flex flex-col border-b md:border-b-0 md:border-r border-white/5 z-20">
          
          {/* TOP BAR: Back & Finish Buttons */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <button onClick={() => router.back()} className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors text-white">
                <ChevronLeft className="h-6 w-6" />
              </button>
              {isSeller && (
                <button 
                  onClick={handleEndStream}
                  disabled={isEnding}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 hover:bg-red-500 transition-colors text-white font-bold text-xs disabled:opacity-50 shadow-lg"
                >
                  <PowerOff className="h-4 w-4" />
                  {isEnding ? 'Cerrando...' : 'Finalizar Transmisión'}
                </button>
              )}
            </div>
          </div>

          {/* REPRODUCTOR YOUTUBE */}
          <div className="flex-1 w-full relative flex items-center justify-center bg-black">
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
          </div>
        </div>

        {/* ========================================================
            COLUMNA DERECHA: INTERACCION (PC) / ABAJO (MOBILE)
            ======================================================== */}
        <div className="flex-1 md:w-1/3 lg:w-1/4 flex flex-col min-h-0 bg-zinc-950 relative z-10 w-full shadow-2xl border-l border-border">
          
          {/* Header Vendedor (Siempre visible) */}
          <div className="shrink-0 p-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10 hidden md:flex">
            <SellerPill seller={seller} initial={initial} />
            <div className="flex items-center gap-3">
              <ViewersPill viewers={viewers} />
              <LiveBadge size="sm" />
            </div>
          </div>
          
          {/* Header Vendedor Mobile */}
          <div className="shrink-0 p-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10 md:hidden">
             <SellerPill seller={seller} initial={initial} />
             <div className="flex items-center gap-3">
               <ViewersPill viewers={viewers} />
               <LiveBadge size="sm" />
             </div>
          </div>

          {/* Zona 2: Producto y Pujas (FIJO) */}
          <div className="shrink-0 bg-zinc-900/20 border-b border-white/5 p-3 flex flex-col gap-3">
            <div className="flex gap-4 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
              <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
                  <h2 className="font-bold text-sm line-clamp-2 leading-tight text-white">{safeProduct.title}</h2>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Última Puja</span>
                    <span className="font-black text-amber-400 text-lg leading-none mt-0.5">{formatPEN(currentBid)}</span>
                  </div>
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                </div>
              </div>
            </div>
            
            {/* Opciones Rápidas de Puja */}
            {safeAuction.id && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                {[safeAuction.bidIncrement, safeAuction.bidIncrement * 2, safeAuction.bidIncrement * 3].map(amt => (
                  <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                ))}
              </div>
            )}
          </div>

          {/* Zona 3: Chat Messages (SCROLLABLE, ESPACIO RESTANTE) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar bg-zinc-950/50">
            <div className="flex-1 flex flex-col justify-end">
              <div className="space-y-3 flex flex-col-reverse">
                {[...chat].reverse().map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
              </div>
            </div>
          </div>

          {/* Zona 4: Footer Fijo de Acción */}
          <div className="shrink-0 p-3 pt-4 border-t border-white/10 bg-zinc-950 pb-safe">
            <div className="flex gap-3 mb-3">
               <div className="flex-1 flex gap-2">
                 {safeAuction.id ? (
                   <PujarButton increment={safeAuction.bidIncrement} onBid={executeRealtimeBid} full />
                 ) : (
                   <button onClick={() => setShowCheckout(true)} className="flex-1 h-12 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg">
                     <ShoppingBag className="h-5 w-5" /> Comprar Ya - {formatPEN(Number(safeProduct?.basePrice) || Number(safeProduct?.price) || 0)}
                   </button>
                 )}
               </div>
               <button onClick={handleLike} className="h-12 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform shrink-0">
                 <Heart className={\`h-6 w-6 \${liked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}\`} />
               </button>
            </div>
            
            {/* Chat Input */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-1.5 py-1.5 focus-within:border-white/20 transition-colors">
              <MessageCircle className="h-5 w-5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Escribe en el chat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none min-w-0"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="h-9 w-9 rounded-xl bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 disabled:opacity-50 disabled:bg-zinc-800 transition-colors shrink-0"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          </div>

        </div>
      </div>

      `;

if (returnStart !== -1) {
    text = text.slice(0, returnStart) + newLayout + text.slice(checkoutStart);
    fs.writeFileSync(file, text, 'utf8');
} else {
    // If not found, use regex
    const regex = /return \([\s\S]*?<CheckoutBottomSheet/;
    text = text.replace(regex, newLayout + '<CheckoutBottomSheet');
    fs.writeFileSync(file, text, 'utf8');
}