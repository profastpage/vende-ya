const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /{\/\* Zona Scrollable \(Producto, Pujas, Chat\) \*\/}[\s\S]*?{\/\* Chat Messages \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newStructure = `{/* Zona 2: Producto y Pujas (FIJO) */}
          <div className="shrink-0 bg-zinc-900/20 border-b border-white/5 p-3 flex flex-col gap-3">
            
            {/* Info de Producto */}
            <div className="flex gap-4 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner">
              <img src={safeProduct.thumbnail} alt={safeProduct.title} className="w-20 h-20 object-cover rounded-lg shadow-md border border-white/10 shrink-0" />
              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
                  <h2 className="font-bold text-sm line-clamp-2 leading-tight">{safeProduct.title}</h2>
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
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar">
            <div className="flex-1 flex flex-col justify-end">
              <div className="space-y-3 flex flex-col-reverse">
                {[...chat].reverse().map((msg) => (
                  <ChatMessageBubble key={msg.id} msg={msg} />
                ))}
              </div>
            </div>
          </div>`;

text = text.replace(regex, newStructure);

fs.writeFileSync(file, text, 'utf8');