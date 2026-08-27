const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Add imports
text = text.replace(
  /import \{ cn \} from '@\/lib\/utils'/,
  "import { cn } from '@/lib/utils'\nimport { requestPayout } from './actions'\nimport { toast } from 'sonner'\nimport { useSession } from '@/components/vendeda/AuthProvider'"
);

// 2. Add state to WalletPanel
text = text.replace(
  /function WalletPanel\(\{ wallet, summary, escrow, isLoading, error \}: \{ wallet: any; summary: any; escrow: any; isLoading: boolean; error: string \| null \}\) \{/,
  `function WalletPanel({ wallet, summary, escrow, isLoading, error }: { wallet: any; summary: any; escrow: any; isLoading: boolean; error: string | null }) {
  const [showPayout, setShowPayout] = React.useState(false);
  const { user } = useSession() as { user: any };`
);

// 3. Update the button
text = text.replace(
  /<button onClick=\{\(\) => alert\("Retiros en desarrollo"\)\} className="mt-2 w-full text-\[10px\] font-bold bg-lime-500\/20 text-lime-400 border border-lime-500\/30 py-1 rounded-md hover:bg-lime-500\/30 transition-colors">Retirar<\/button>/,
  `<button onClick={() => setShowPayout(true)} className="mt-2 w-full text-[10px] font-bold bg-lime-500/20 text-lime-400 border border-lime-500/30 py-1 rounded-md hover:bg-lime-500/30 transition-colors">Retirar</button>`
);

// 4. Inject Modal before the final closing div of WalletPanel
const modalCode = `
      {/* Payout Modal */}
      {showPayout && escrow && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
          >
            <button onClick={() => setShowPayout(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/50 hover:text-white"><Zap className="w-4 h-4 rotate-45" /></button>
            <h3 className="text-xl font-black text-white mb-1">Solicitar Retiro</h3>
            <p className="text-sm text-zinc-400 mb-6">Disponible: <span className="font-bold text-lime-400">{formatPEN(escrow.availableBalance)}</span></p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const amount = Number(formData.get('amount'));
              const method = formData.get('method') as string;
              const details = formData.get('details') as string;
              
              if(amount > escrow.availableBalance) return toast.error("Monto supera tu saldo disponible");
              if(amount < 10) return toast.error("El retiro mínimo es S/ 10.00");
              
              const res = await requestPayout(user?.id || '', amount, method, details);
              if(res?.error) {
                toast.error(res.error);
              } else {
                toast.success("Retiro solicitado con éxito. En proceso.");
                setShowPayout(false);
                window.location.reload();
              }
            }} className="flex flex-col gap-4">
              
              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1 block">Monto a retirar (S/)</label>
                <input type="number" name="amount" step="0.01" max={escrow.availableBalance} defaultValue={escrow.availableBalance} required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-vendeda-primary transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1 block">Método de Retiro</label>
                <select name="method" required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-vendeda-primary transition-colors appearance-none">
                  <option value="yape">Yape / Plin</option>
                  <option value="bank">Transferencia Bancaria (CCI)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 mb-1 block">Detalles de la cuenta</label>
                <input type="text" name="details" placeholder="Número de celular o CCI" required className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-vendeda-primary transition-colors" />
              </div>
              
              <button type="submit" className="mt-2 w-full bg-vendeda-primary text-black font-black text-sm py-4 rounded-xl hover:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" /> Enviar Solicitud
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.section>
  )
}
`

text = text.replace(/<\/motion\.section>\n  \)\n\}/, modalCode);

fs.writeFileSync(file, text, 'utf8');