const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// ==============================================
// 1. REFACTOR DESKTOP LAYOUT
// ==============================================
const desktopRegex = /const DesktopLayout = \([\s\S]*?\/\* COLUMNA DERECHA: Chat \*\//;
const newDesktop = `const DesktopLayout = (
    <div className="flex gap-6 max-w-7xl mx-auto p-4 bg-black text-zinc-100 min-h-[calc(100vh-4rem)]">
      {/* COLUMNA IZQUIERDA: Área Principal (Video, Producto y Puja) */}
      <main className="flex-1 space-y-4 flex flex-col min-w-0">
        
        {/* Info Header (Outside Video) */}
        <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="h-9 w-9 rounded-full bg-black/40 border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>
          <div className="flex items-center gap-3">
            <ViewersPill viewers={viewers} />
            <LiveBadge />
          </div>
        </div>

        {/* Video Player (Pure block, no overlays) */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
        </div>

        {/* Producto y Puja */}
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex-1 relative overflow-hidden">
          <div className="flex gap-6 relative z-10">
            <img src={product.thumbnail} alt={product.title} className="w-40 h-40 object-cover rounded-xl shadow-lg border border-white/5" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h1 className="text-2xl font-bold mb-2 tracking-tight">{product.title}</h1>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{product.description}</p>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 w-fit mt-4">
                <div>
                  <div className="text-xs text-zinc-500 font-medium mb-0.5 uppercase tracking-wider">Puja Inicial</div>
                  <div className="text-xl font-black text-white">{formatPEN(product.basePrice)}</div>
                </div>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <div>
                  <div className="text-xs text-amber-500/80 font-medium mb-0.5 uppercase tracking-wider">Última Puja</div>
                  <div className="text-2xl font-black text-amber-400">{formatPEN(currentPrice)}</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Right */}
            <div className="flex flex-col items-center gap-3 min-w-[120px]">
              <div className="w-full text-center">
                <TimePill seconds={secondsLeft} />
              </div>
              <div className="w-full flex-1 flex items-stretch">
                <PujarButton increment={product.minIncrement} onBid={handleBid} full />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* COLUMNA DERECHA: Chat */`;
text = text.replace(desktopRegex, newDesktop);


// ==============================================
// 2. REFACTOR MOBILE LAYOUT
// ==============================================
const mobileRegex = /const MobileLayout = \([\s\S]*?return \(/;
const newMobile = `const MobileLayout = (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden">
      
      {/* 1. ZONA SEGURA DEL REPRODUCTOR (Arriba, Pure block) */}
      <div className="w-full aspect-video bg-black flex-shrink-0 relative border-b border-white/10">
        <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
      </div>

      {/* 2. ZONA DE INTERACCIÓN Y VENTAS (Abajo) */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-zinc-950">
        
        {/* Mobile Header (Seller Info) */}
        <div className="px-3 py-2 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>
          <div className="flex items-center gap-2">
            <ViewersPill viewers={viewers} />
            <LiveBadge size="sm" />
          </div>
        </div>

        {/* Product / Bidding Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          
          <div className="p-4 bg-zinc-900/30 border-b border-white/5">
            <div className="flex gap-4">
              <img src={product.thumbnail} alt={product.title} className="w-24 h-24 object-cover rounded-lg shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 leading-snug">{product.title}</h2>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Última Puja</span>
                    <span className="font-black text-amber-400 text-lg">{formatPEN(currentPrice)}</span>
                  </div>
                  <TimePill seconds={secondsLeft} size="sm" />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <PujarButton increment={product.minIncrement} onBid={handleBid} full />
              <button 
                onClick={() => setLikes(l => l + 1)}
                className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 min-h-0 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar flex flex-col-reverse pb-2">
              {[...chat].reverse().map((msg) => (
                <ChatMessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
            
            {/* Mobile Chat Input Area */}
            <div className="pt-2">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 rounded-2xl pl-3 pr-1.5 py-1.5">
                <MessageCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Escribe..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none min-w-0"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-amber-400 text-black disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (`;
text = text.replace(mobileRegex, newMobile);

fs.writeFileSync(file, text, 'utf8');