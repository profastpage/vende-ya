const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<AnimatePresence mode="wait">\r?\n\s*\{mobileTab === 'bid' \? \([\s\S]*?\{\/\* Stock mini-info \*\/\}/;

const newMobileTab = `<AnimatePresence mode="wait">
              {mobileTab === 'bid' ? (
                <motion.div
                  key="bid"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {auction ? (
                    <>
                      {/* Leader price compact */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-[9px] font-black tracking-widest uppercase text-amber-400">
                            <Crown className="inline h-2.5 w-2.5 mr-1" />Puja líder
                          </span>
                          <p className="text-lg font-black text-amber-400 font-mono tabular-nums leading-none mt-0.5">
                            {formatPEN(currentBid)}
                          </p>
                        </div>
                        <CountdownCard mm={mm} ss={ss} lowTime={lowTime} size="sm" />
                      </div>

                      {/* Quick bid pills */}
                      <div className="flex gap-1.5 mb-1.5">
                        {QUICK_BIDS.map((amt) => (
                          <BidPill key={amt} amount={amt} onBid={executeRealtimeBid} />
                        ))}
                      </div>

                      <PujarButton increment={safeAuction.bidIncrement || 2} onBid={executeRealtimeBid} full />
                      <div className="mt-1.5">
                        <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Live Shopping Mode Mobile */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-[10px] font-black tracking-widest uppercase text-sky-400">
                            <ShoppingBag className="inline h-3 w-3 mr-1" />Live Shopping
                          </span>
                          <p className="text-2xl font-black text-white font-mono tabular-nums leading-none mt-1">
                            {formatPEN(buyNowPrice)}
                          </p>
                        </div>
                      </div>
                      
                      <ComprarYaButton buyNowPrice={buyNowPrice} onBuy={() => { setShowCheckout(true); setHasParticipated(true) }} full />
                    </>
                  )}

                  {/* Stock mini-info */}`;

if (regex.test(text)) {
    text = text.replace(regex, newMobileTab);
    console.log('Fixed Mobile Layout conditional rendering');
} else {
    console.log('Mobile layout regex failed');
}

// Rename "Puja" tab to "Comprar" if no auction
text = text.replace(
    /<Gavel className="inline h-3 w-3 mr-1" \/>Puja/,
    '{auction ? <><Gavel className="inline h-3 w-3 mr-1" />Puja</> : <><ShoppingBag className="inline h-3 w-3 mr-1" />Comprar</>}'
);

fs.writeFileSync(file, text, 'utf8');