const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\/\\* 4A: Chat Input & Like \\*\/[\s\S]*?\{\/\* Pequeño Banner Informativo/;

const replacement = `/* 4A: Chat Input & Like (eBay Style) */
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
                  className="w-full flex items-center justify-between px-4 h-10 border border-white rounded-full bg-transparent backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  <span className="text-white/80 text-[13px] font-medium">Inicia sesión para comentar...</span>
                </Link>
              ) : (
                <div className="w-full flex items-center px-4 h-10 border border-white rounded-full bg-transparent backdrop-blur-md focus-within:bg-black/30 transition-colors">
                  <input
                    type="text"
                    placeholder="Agregar comentario..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/90 focus:outline-none min-w-0 font-medium"
                  />
                  <button onClick={handleLike} className="flex items-center justify-center shrink-0 ml-2 active:scale-90 transition-transform">
                    <Heart className={\`h-5 w-5 \${liked ? 'fill-rose-500 text-rose-500' : 'fill-rose-500 text-rose-500'}\`} strokeWidth={0} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Pequeño Banner Informativo`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');