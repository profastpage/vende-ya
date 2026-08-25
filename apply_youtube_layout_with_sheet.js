const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');

// Restore the file to HEAD first
require('child_process').execSync('git checkout HEAD -- "' + file + '"');

let text = fs.readFileSync(file, 'utf8');

const unifiedLayout = `
  const youtubeUrl = \`https://www.youtube.com/embed/\${stream?.streamProviderId || stream?.youtubeLiveId || '21X5lGlDOfg'}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0\`;

  return (
    <>
      <div className="flex flex-col w-full h-[100dvh] bg-background overflow-hidden text-foreground">
        
        {/* 1. ZONA DE VIDEO (Rigida, sin superposiciones) */}
        <div className="w-full h-[35vh] md:h-[50vh] md:max-h-[600px] shrink-0 bg-black relative flex items-center justify-center border-b border-white/5 shadow-lg z-20">
          <iframe
            src={youtubeUrl}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
          
          {/* Back Button Overlay - Solamente boton de volver encima, YouTube lo permite */}
          <button onClick={() => router.back()} className="absolute top-4 left-4 z-30 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        {/* 2. ZONA INTERACTIVA (Ocupa el resto de la pantalla) */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 relative z-10 max-w-5xl mx-auto w-full border-x border-white/5 shadow-2xl">
          
          {/* Header Vendedor */}
          <div className="shrink-0 p-3 border-b border-white/10 flex items-center justify-between bg-zinc-900/40 backdrop-blur-sm z-10">
            <SellerPill seller={seller} initial={initial} />
            <div className="flex items-center gap-3">
              <ViewersPill viewers={viewers} />
              <LiveBadge size="sm" />
            </div>
          </div>

          {/* Zona Scrollable (Producto, Pujas, Chat) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-4 space-y-4 no-scrollbar">
            
            {/* Info de Producto */}
            <div className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 shrink-0">
              <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-24 h-24 object-cover rounded-xl shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
                  <h2 className="font-bold text-base line-clamp-2 leading-snug">{safeProduct.title}</h2>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-1">{safeProduct.description}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Última Puja</span>
                    <span className="font-black text-amber-400 text-xl leading-none mt-0.5">{formatPEN(currentBid)}</span>
                  </div>
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                </div>
              </div>
            </div>
            
            {/* Opciones Rápidas de Puja (Solo si es subasta) */}
            {safeAuction.id && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0 px-1">
                {[safeAuction.bidIncrement, safeAuction.bidIncrement * 2, safeAuction.bidIncrement * 3].map(amt => (
                  <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                ))}
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 min-h-[200px] flex flex-col justify-end">
              <div className="space-y-3 flex flex-col-reverse">
                {[...chat].reverse().map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
              </div>
            </div>
            
          </div>

          {/* Footer Fijo de Acción */}
          <div className="shrink-0 p-3 pt-4 border-t border-white/10 bg-zinc-950 pb-safe">
            <div className="flex gap-3 mb-3">
               <div className="flex-1 flex gap-2">
                 {safeAuction.id ? (
                   <PujarButton increment={safeAuction.bidIncrement} onBid={executeRealtimeBid} full />
                 ) : (
                   <button onClick={() => setShowCheckout(true)} className="flex-1 h-12 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                     <ShoppingBag className="h-5 w-5" /> Comprar Ya - {formatPEN(safeProduct.basePrice)}
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

      <CheckoutBottomSheet
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productId={safeProduct.id ?? id}
        productName={safeProduct.title ?? 'Subasta'}
        price={buyNowPrice}
        source="live_stream"
        sellerId={seller.id}
        shipment={{
          originAgencyId: 'LIM-01',
          destinationAgencyId: 'LIM-02',
          senderDni: '12345678',
          senderName: seller.displayName,
          senderPhone: '999888777',
          receiverDni: '87654321',
          receiverName: 'Tú',
          receiverPhone: '999111222',
          packageDescription: safeProduct.title ?? 'Subasta',
          weightKg: 0.5,
          declaredValue: buyNowPrice,
        }}
      />
    </>
  )
}
`;

const desktopStartIdx = text.indexOf('const DesktopLayout = (');
const mobileStartIdx = text.indexOf('const MobileLayout = (');
// we want to replace everything from desktopStartIdx to the end of the file.
if (desktopStartIdx !== -1) {
  text = text.slice(0, desktopStartIdx) + unifiedLayout;
}

if (!text.includes("ChevronRight,")) {
  text = text.replace(/ChevronLeft,/, "ChevronLeft, ChevronRight,");
}
if (!text.includes("ShoppingBag,")) {
  text = text.replace(/ChevronLeft,/, "ShoppingBag, ChevronLeft,");
}

fs.writeFileSync(file, text, 'utf8');