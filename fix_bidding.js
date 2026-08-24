const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// For Desktop bidding box
text = text.replace(
    /<div className="bg-zinc-900\/50 border border-zinc-800 rounded-2xl p-6 space-y-5">[\s\S]*?<PujarButton increment=\{safeAuction\.bidIncrement \|\| 2\} onBid=\{executeRealtimeBid\} \/>\r?\n\s*<ComprarYaButton buyNowPrice=\{buyNowPrice\} onBuy=\{\(\) => \{ setShowCheckout\(true\); setHasParticipated\(true\) \}\} \/>\r?\n\s*<\/div>\r?\n\s*<\/div>/,
    `<div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
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
              <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} />
            </div>
          </div>`
);

// Mobile buttons
text = text.replace(
    /\{\/\* Primary CTA — más compacto \(py-2\.5 vs py-3\) \*\/\}\r?\n\s*<PujarButton increment=\{safeAuction\.bidIncrement \|\| 2\} onBid=\{executeRealtimeBid\} full \/>\r?\n\r?\n\s*\{\/\* Secondary CTA \*\/\}\r?\n\s*<div className="mt-1\.5">\r?\n\s*<ComprarYaButton buyNowPrice=\{buyNowPrice\} onBuy=\{\(\) => \{ setShowCheckout\(true\); setHasParticipated\(true\) \}\} full \/>\r?\n\s*<\/div>/,
    `{/* Conditional CTA */}
                  {auction ? (
                    <>
                      <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} full />
                      <div className="mt-1.5">
                        <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                      </div>
                    </>
                  ) : (
                    <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                  )}`
);


fs.writeFileSync(file, text, 'utf8');
console.log('Fixed Bidding UI condition');