const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Mobile top bar alignment
const oldTopBar = `<div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 gap-2 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Volver"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>

          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <LiveBadge />
            <ViewersPill viewers={viewers} />
          </div>
        </div>`;

const newTopBar = `<div className="absolute top-0 inset-x-0 p-4 pt-6 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 rounded-full bg-black/40 backdrop-blur-xl border border-border flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Volver"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <SellerPill seller={seller} initial={initial} />
          </div>

          <div className="flex flex-col items-end gap-1.5 pointer-events-auto mt-0.5">
            <LiveBadge />
            <ViewersPill viewers={viewers} />
          </div>
        </div>`;

text = text.replace(oldTopBar, newTopBar);


// 2. Share button functionality
text = text.replace(
    /const handleLike = \(\) => \{/g,
    `const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: stream?.title || 'Vende Ya En Vivo',
          text: '¡Únete a esta transmisión en Vende Ya!',
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('¡Enlace copiado al portapapeles!')
      }
    } catch (e) {}
  }
  
  const handleLike = () => {`
);

text = text.replace(/<button className="flex flex-col items-center gap-0.5">/g, '<button onClick={handleShare} className="flex flex-col items-center gap-0.5">');


// 3. Conditional Bidding UI vs Live Shopping
const oldBiddingUI = `<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" /> Puja líder actual
                </span>
                <p className="text-4xl font-black text-amber-400 font-mono tabular-nums mt-1">
                  {formatPEN(currentBid)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Por <span className="font-bold text-sky-400">Diego</span> • hace 36s
                </p>
              </div>
              <div className="flex gap-2">
                <CountdownCard mm={mm} ss={ss} lowTime={lowTime} />
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 flex flex-col items-center min-w-[88px]">
                  <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                    <Gavel className="inline h-2.5 w-2.5 mr-1" />Pujas
                  </span>
                  <span className="text-xl font-black font-mono text-white tabular-nums">{bidCount}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2">
                Puja rápida
              </p>
              <div className="flex gap-2">
                {QUICK_BIDS.map((amt) => (
                  <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} />
              <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} />
            </div>
          </div>`;

const newBiddingUI = `<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
            {auction ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" /> Puja líder actual
                    </span>
                    <p className="text-4xl font-black text-amber-400 font-mono tabular-nums mt-1">
                      {formatPEN(currentBid)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Por <span className="font-bold text-sky-400">Tú</span> • hace 1s
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CountdownCard mm={mm} ss={ss} lowTime={lowTime} />
                    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 flex flex-col items-center min-w-[88px]">
                      <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                        <Gavel className="inline h-2.5 w-2.5 mr-1" />Pujas
                      </span>
                      <span className="text-xl font-black font-mono text-white tabular-nums">{bidCount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-2">
                    Puja rápida
                  </p>
                  <div className="flex gap-2">
                    {QUICK_BIDS.map((amt) => (
                      <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-black tracking-widest uppercase text-sky-400 flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> Live Shopping
                    </span>
                    <p className="text-4xl font-black text-white font-mono tabular-nums mt-1">
                      {formatPEN(buyNowPrice)}
                    </p>
                  </div>
                </div>
            )}

            <div className="flex gap-3">
              {auction && <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} />}
              <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full={!auction} />
            </div>
          </div>`;

text = text.replace(oldBiddingUI, newBiddingUI);


// Mobile conditional button
const oldMobileBtns = `{/* Primary CTA — más compacto (py-2.5 vs py-3) */}
                  <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} full />

                  {/* Secondary CTA */}
                  <div className="mt-1.5">
                    <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                  </div>`;

const newMobileBtns = `{/* Conditional CTA */}
                  {auction ? (
                    <>
                      <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} full />
                      <div className="mt-1.5">
                        <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                      </div>
                    </>
                  ) : (
                    <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                  )}`;
text = text.replace(oldMobileBtns, newMobileBtns);

// 4. Supabase Chat Broadcast
text = text.replace(
    /const channel = supabase\r?\n\s*\.channel\(\`auction_\$\{safeAuction\.id\}\`\)/,
    `const chatChannel = supabase.channel(\`chat_\${id}\`)
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => [...prev, payload.payload])
      }).subscribe()

      const channel = supabase
        .channel(\`auction_\${safeAuction.id}\`)`
);

text = text.replace(
    /return \(\) => \{ supabase\.removeChannel\(channel\) \}/,
    'return () => { supabase.removeChannel(channel); supabase.removeChannel(chatChannel); }'
);

text = text.replace(
    /const sendChat = \(\) => \{[\s\S]*?setChatInput\(''\)\r?\n\s*\}/,
    `const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg = { id: Date.now().toString(), username: 'Tú', text: chatInput.trim(), color: 'text-lime-400' }
    setChat((prev) => [...prev, msg])
    setChatInput('')
    // Broadcast to others
    await supabase.channel(\`chat_\${id}\`).send({
      type: 'broadcast',
      event: 'new_message',
      payload: { ...msg, username: 'Comprador' }
    })
  }`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Applied multiple layout and functional fixes');