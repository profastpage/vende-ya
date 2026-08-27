const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const startStr = "{/* Zona 4: Footer";
const startIndex = text.indexOf(startStr);

if (startIndex !== -1) {
  const replacement = `{/* Zona 4: Footer Fijo de Acción (Estilo eBay Live) */}
          <div className="shrink-0 pt-2 pb-safe bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* 4A: Chat Input & Like (eBay Style) */}
            <div className="flex items-center gap-3 mb-2 px-3 relative">
              {/* Floating Emojis */}
              <div className="absolute bottom-12 right-6 pointer-events-none overflow-visible z-50">
                <AnimatePresence>
                  {floatingHearts.map(heart => (
                    <motion.span
                      key={heart.id}
                      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -150, x: heart.left, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute text-2xl select-none"
                    >
                      ❤️
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              {!user ? (
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-between px-4 h-10 border border-white/30 rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <span className="text-white/80 text-[13px] font-medium">Inicia sesión para comentar...</span>
                </Link>
              ) : (
                <div className="w-full flex items-center px-4 h-10 border border-white/50 rounded-full bg-black/40 backdrop-blur-md focus-within:border-white transition-colors">
                  <input
                    type="text"
                    placeholder="Agregar comentario..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/80 focus:outline-none min-w-0 font-medium"
                  />
                  {chatInput.trim() ? (
                    <button onClick={sendChat} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform text-white">
                      <ChevronRight className="h-6 w-6" strokeWidth={3} />
                    </button>
                  ) : (
                    <button onClick={handleLike} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">
                      <Heart className={\`h-5 w-5 \${liked ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}\`} strokeWidth={0} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Pequeño Banner Informativo (estilo eBay) */}
            <div className="px-4 py-1.5 mb-2 mx-3 bg-black/40 backdrop-blur-md rounded-md border border-white/5 flex items-center justify-center">
              <p className="text-[10px] text-white/70 font-medium text-center truncate">
                Vende Ya asegura tu compra hasta la entrega | Envíos a todo el Perú
              </p>
            </div>

            {/* 4B: Product Box */}
            <div className="bg-[#1c1c1e]/95 backdrop-blur-xl mx-3 mb-3 p-3.5 rounded-[20px] border border-white/10 shadow-2xl relative z-10">
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex-1 pr-3">
                  <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2">
                    {safeProduct?.id ? \`#\${safeProduct.id.substring(0,4).toUpperCase()} - \` : ''}{safeProduct?.title || 'Producto en Vivo'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-white font-black text-sm tabular-nums">{formatPEN(buyNowPrice)}</span>
                    <span className="text-zinc-400 text-[10px] font-medium truncate">+ Envío por pagar</span>
                  </div>
                  {safeAuction.id && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Gavel className="h-3 w-3 text-emerald-400" />
                      <span className="text-zinc-300 text-[10px] font-medium"><strong className="text-emerald-400">{bidCount}</strong> pujas registradas</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-white/50 shrink-0 mt-0.5" />
              </div>

              <div className="flex gap-2.5 mt-3 pt-3 border-t border-white/10">
                {safeAuction.id ? (
                  <>
                    <button className="flex-1 h-10 rounded-full border border-white/20 bg-transparent text-white text-[13px] font-bold active:bg-white/10 transition-colors">
                      Oferta máxima
                    </button>
                    <button 
                      onClick={() => executeRealtimeBid(safeAuction.bidIncrement)}
                      className="flex-1 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[13px] font-extrabold active:scale-95 transition-transform shadow-lg shadow-emerald-500/20">
                      Ofertar {formatPEN(currentBid + safeAuction.bidIncrement)}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setShowCheckout(true)} className="w-full h-11 bg-white hover:bg-zinc-100 text-black text-[14px] font-extrabold rounded-full active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-xl">
                    Comprar Ya
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <CheckoutBottomSheet
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        productId={safeProduct.id ?? id}
        productName={safeProduct.title ?? 'Compra en Vivo'}
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
          receiverName: user?.displayName || 'Usuario',
          receiverPhone: '999111222',
          packageDescription: safeProduct.title ?? 'Paquete',
          weightKg: 0.5,
          declaredValue: buyNowPrice,
        }}
      />
    </>
  )
}
`;
  text = text.substring(0, startIndex) + replacement;
  fs.writeFileSync(file, text, 'utf8');
  console.log("Replaced Zona 4 successfully to EOF");
} else {
  console.log("Could not find start index for Zona 4. Start:", startIndex);
}