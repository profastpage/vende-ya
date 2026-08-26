const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add useAuth import and Link import if not present
if (!text.includes('useAuth')) {
    text = text.replace(/import { useTransition } from 'react'/, `import { useTransition } from 'react'\nimport { useAuth } from '@/components/vendeda/AuthProvider'\nimport Link from 'next/link'`);
}

// 2. Add Viewer list state and simulation
const viewerPillOld = /function ViewersPill\(\{ viewers \}: \{ viewers: number \}\) \{\s*return \([\s\S]*?\)\s*\}/;
const viewerPillNew = `function ViewersPill({ viewers }: { viewers: number }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5 text-amber-400" strokeWidth={2.5} />
        <span className="text-xs font-black tabular-nums drop-shadow-lg">
          {formatViewers(viewers)}
        </span>
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 origin-top-right"
          >
            <div className="text-[10px] font-bold text-zinc-500 uppercase px-2 mb-2">Espectadores ({viewers})</div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto no-scrollbar">
              {/* Simulated MVP Viewers */}
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">L</div>
                <span className="text-xs font-medium text-white truncate">Luis.tech</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">M</div>
                <span className="text-xs font-medium text-white truncate">MariaGomez99</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white">J</div>
                <span className="text-xs font-medium text-white truncate">Juan_perez</span>
              </div>
              <div className="px-2 py-1.5 text-xs text-zinc-500 italic">
                y {Math.max(0, viewers - 3)} más...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}`;
text = text.replace(viewerPillOld, viewerPillNew);

// 3. Inject useAuth inside the main component
const mainCompRegex = /export default function LiveRoomClient\(\{ stream, auction, product, seller, initialChat, currentUserId \}: \{ stream: any, auction: any, product: any, seller: any, initialChat\?: ChatMessage\[\], currentUserId\?: string \}\) \{/;
const mainCompInject = `export default function LiveRoomClient({ stream, auction, product, seller, initialChat, currentUserId }: { stream: any, auction: any, product: any, seller: any, initialChat?: ChatMessage[], currentUserId?: string }) {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || user?.user_metadata?.name || 'Usuario';
`;
text = text.replace(mainCompRegex, mainCompInject);

// 4. Modify sendChat to use the real name
const sendChatRegex = /const msg = \{ id: Date\.now\(\)\.toString\(\), username: 'Tǧ', text: chatInput\.trim\(\), color: 'text-lime-400' \}/;
const sendChatNew = `const msg = { id: Date.now().toString(), username: userName, text: chatInput.trim(), color: 'text-lime-400' }`;
text = text.replace(sendChatRegex, sendChatNew);
// Also update the fetch call payload inside sendChat
const fetchRegex = /username: 'Comprador'/;
const fetchNew = `username: userName`;
text = text.replace(fetchRegex, fetchNew);


// 5. Auth Gate for Chat Input
const chatInputRegex = /{\/\* Chat Input \*\/}[\s\S]*?<\/div>\s*<\/div>/;
const chatInputNew = `{/* Chat Input */}
            {!user ? (
              <div className="flex items-center justify-between p-3 bg-zinc-900/80 border border-white/10 rounded-2xl">
                <span className="text-xs text-zinc-400 font-medium">¿Quieres comentar y pujar?</span>
                <Link 
                  href="/login" 
                  className="text-xs font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl transition-colors hover:bg-amber-400/20"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
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
            )}
          </div>`;
text = text.replace(chatInputRegex, chatInputNew);

// 6. Update Finish Button to be circular icon
const oldFinishButton = /<button \s*onClick=\{handleEndStream\}\s*disabled=\{isEnding\}\s*className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600\/90 backdrop-blur-md border border-red-500\/50 hover:bg-red-500 transition-colors text-white font-bold text-xs disabled:opacity-50 shadow-lg"\s*>[\s\S]*?<\/button>/;
const newFinishButton = `<button 
                  onClick={handleEndStream}
                  disabled={isEnding}
                  className="h-10 w-10 rounded-full bg-red-600/90 backdrop-blur-md border border-red-500/50 hover:bg-red-500 transition-all text-white flex items-center justify-center shadow-lg disabled:opacity-50"
                  title="Finalizar Transmisión"
                >
                  {isEnding ? <Loader2 className="h-5 w-5 animate-spin" /> : <PowerOff className="h-5 w-5" />}
                </button>`;
text = text.replace(oldFinishButton, newFinishButton);


fs.writeFileSync(file, text, 'utf8');