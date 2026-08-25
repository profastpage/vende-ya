const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// ==============================================
// 1. REFACTOR MOBILE LAYOUT (Strict Stacked)
// ==============================================
// Find MobileLayout from `const MobileLayout = (` down to `) \n\n  return (`
const mobileStartIdx = text.indexOf('const MobileLayout = (');
const returnIdx = text.indexOf('\n  return (', mobileStartIdx);
if (mobileStartIdx === -1 || returnIdx === -1) {
  console.log("Could not find MobileLayout");
  process.exit(1);
}

const newMobile = `const MobileLayout = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-white select-none overflow-hidden">
      
      {/* 1. ZONA SEGURA DEL REPRODUCTOR (Arriba, Pure block) */}
      <div className="w-full aspect-video bg-black flex-shrink-0 relative">
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

        {/* Product / Bidding / Chat Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          
          <div className="p-3 bg-zinc-900/30 border-b border-white/5 shrink-0">
            <div className="flex gap-3">
              <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="font-bold text-sm line-clamp-2 leading-snug">{safeProduct.title}</h2>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Última Puja</span>
                    <span className="font-black text-amber-400 text-lg">{formatPEN(currentBid)}</span>
                  </div>
                  <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                </div>
              </div>
            </div>
            
            {safeAuction.id && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[safeAuction.bidIncrement, safeAuction.bidIncrement * 2, safeAuction.bidIncrement * 3].map(amt => (
                  <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                ))}
              </div>
            )}
            
            <div className="mt-3 flex gap-2">
              <PujarButton increment={safeAuction.bidIncrement} onBid={executeRealtimeBid} full />
              <button 
                onClick={handleLike}
                className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Heart className={\`h-5 w-5 \${liked ? 'fill-rose-500 text-rose-500' : 'text-white'}\`} />
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="flex-1 min-h-0 flex flex-col p-3">
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar flex flex-col-reverse pb-2">
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
                  <MessageCircle className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
`;

const textAfterMobile = text.slice(returnIdx);
const textBeforeMobile = text.slice(0, mobileStartIdx);


// ==============================================
// 2. REFACTOR DESKTOP LAYOUT (Remove overlays)
// ==============================================
let finalBeforeMobile = textBeforeMobile;
const desktopStartIdx = finalBeforeMobile.indexOf('const DesktopLayout = (');
const desktopEndIdx = finalBeforeMobile.indexOf('/* ================================================================ *\n   * MOBILE LAYOUT');

if (desktopStartIdx !== -1 && desktopEndIdx !== -1) {
  const desktopBlockRegex = /<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">[\s\S]*?<\/div>\s*<\/div>/;
  
  const pureDesktopBlock = `<div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-white/5 mb-4">
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
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />
        </div>`;
        
  finalBeforeMobile = finalBeforeMobile.replace(desktopBlockRegex, pureDesktopBlock);
}

const finalFileText = finalBeforeMobile + newMobile + textAfterMobile;
fs.writeFileSync(file, finalFileText, 'utf8');