const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Completely rewrite DesktopLayout
const desktopStartIdx = text.indexOf('const DesktopLayout = (');
const desktopEndIdx = text.indexOf('/* ================================================================ *\n   * MOBILE LAYOUT');
if (desktopStartIdx !== -1 && desktopEndIdx !== -1) {
  const newDesktop = `const DesktopLayout = (
    <div className="flex gap-6 max-w-7xl mx-auto p-4 bg-zinc-950 text-zinc-100 min-h-[calc(100vh-4rem)]">
      {/* COLUMNA IZQUIERDA: Área Principal (Video, Producto y Puja) */}
      <main className="flex-1 space-y-4 flex flex-col min-w-0">
        
        {/* Info Header (Outside Video) */}
        <div className="flex justify-between items-center bg-zinc-900/80 p-3 rounded-xl border border-white/10 shrink-0">
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
        <div className="relative w-full aspect-[9/16] md:aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 shrink-0">
          <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
        </div>

        {/* Producto y Puja */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shrink-0 relative overflow-hidden">
          <div className="flex gap-6 relative z-10">
            <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-32 h-32 object-cover rounded-xl shadow-lg border border-white/10" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h1 className="text-xl font-bold mb-1 tracking-tight line-clamp-1">{safeProduct.title}</h1>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{safeProduct.description}</p>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 w-fit mt-3">
                <div>
                  <div className="text-[10px] text-zinc-500 font-medium mb-0.5 uppercase tracking-wider">Última Puja</div>
                  <div className="text-xl font-black text-amber-400">{formatPEN(currentBid)}</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Right */}
            <div className="flex flex-col items-center gap-3 min-w-[140px]">
              <div className="w-full text-center">
                <CountdownCard mm={mm} ss={ss} lowTime={lowTime} />
              </div>
              <div className="w-full flex-1 flex items-stretch">
                <PujarButton increment={safeAuction.bidIncrement} onBid={executeRealtimeBid} full />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* COLUMNA DERECHA: Chat */}
      <aside className="w-80 flex flex-col bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shrink-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between shrink-0">
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-300">Chat en vivo</h3>
          <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-full">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            {viewers}
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar flex flex-col-reverse bg-gradient-to-b from-transparent to-black/20 min-h-0">
          {[...chat].reverse().map((msg) => (
            <ChatMessageBubble key={msg.id} msg={msg} />
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-black/40 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-1.5 py-1.5 focus-within:border-amber-400/50 transition-colors">
            <MessageCircle className="h-4 w-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Escribe..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )

  `;

  text = text.slice(0, desktopStartIdx) + newDesktop + text.slice(desktopEndIdx);
}

fs.writeFileSync(file, text, 'utf8');