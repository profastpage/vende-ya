const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\CheckoutBottomSheet.tsx');
let text = fs.readFileSync(file, 'utf8');

// We need to add state for operation code and shipping cost
if (!text.includes('operationCode')) {
  text = text.replace(/const \[orderId, setOrderId\] = useState<string \| null>\(null\);/, `const [orderId, setOrderId] = useState<string | null>(null);
  const [operationCode, setOperationCode] = useState('');
  const [shippingDest, setShippingDest] = useState('LIMA-CENTRO');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const currentShippingCost = shippingDest === 'RETIRO' ? 0 : 15.00;
  const finalPrice = price + currentShippingCost;
`);
}

// Replace formatPEN(price) with formatPEN(finalPrice) in the bottom summary
text = text.replace(/<span className="font-bold text-amber-400 text-sm">\{formatPEN\(price\)\}<\/span>/g, `<span className="font-bold text-amber-400 text-sm">{formatPEN(finalPrice)}</span>`);

// Replace Yape block
const yapeRegex = /\{paymentMethod === 'yape' && \([\s\S]*?<\/motion\.div>\s*\)\}/;
const yapeNew = `{['yape', 'plin'].includes(paymentMethod) && (
                      <motion.div
                        key="yape-plin"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={\`\${paymentMethod === 'yape' ? 'bg-purple-950/20 border-purple-900/50' : 'bg-teal-950/20 border-teal-900/50'} border rounded-2xl p-4 mb-4\`}
                      >
                        <p className={\`text-xs \${paymentMethod === 'yape' ? 'text-purple-300' : 'text-teal-300'} mb-3 text-center\`}>
                          1. Transfiere exactamente <b>{formatPEN(finalPrice)}</b> a este número:
                        </p>
                        
                        <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 mb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Celular Empresa</span>
                            <span className="text-xl font-mono font-black text-white">999 888 777</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('999888777');
                              setCopiedPhone(true);
                              setTimeout(() => setCopiedPhone(false), 2000);
                            }}
                            className={\`h-10 w-10 rounded-lg flex items-center justify-center transition-colors \${copiedPhone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/20'}\`}
                          >
                            {copiedPhone ? <CheckCircle2 className="h-5 w-5" /> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                          </button>
                        </div>
                        
                        <p className={\`text-xs \${paymentMethod === 'yape' ? 'text-purple-300' : 'text-teal-300'} mb-2 text-center\`}>
                          2. Ingresa tu número de operación:
                        </p>
                        <input
                          type="text"
                          placeholder="Ej: 12345678"
                          value={operationCode}
                          onChange={(e) => setOperationCode(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                        />
                      </motion.div>
                    )}`;
text = text.replace(yapeRegex, yapeNew);

// Remove Plin block since it's merged
const plinRegex = /\{paymentMethod === 'plin' && \([\s\S]*?<\/motion\.div>\s*\)\}/;
text = text.replace(plinRegex, '');

// Inject Shalom Dropdown in the Summary
const shalomRegex = /<div className="flex justify-between">[\s\S]*?<span>Envío:<\/span>[\s\S]*?<\/div>/;
const shalomNew = `<div className="flex justify-between items-center mb-1">
                        <span>Destino (Shalom):</span>
                        <select 
                          value={shippingDest} 
                          onChange={(e) => setShippingDest(e.target.value)}
                          className="bg-zinc-900 border border-white/10 rounded-lg text-xs px-2 py-1 outline-none text-amber-400 focus:border-amber-400"
                        >
                          <option value="RETIRO">Retiro en tienda (S/ 0)</option>
                          <option value="LIMA-CENTRO">Lima Centro (S/ 15.00)</option>
                          <option value="AREQUIPA">Arequipa (S/ 15.00)</option>
                          <option value="TRUJILLO">Trujillo (S/ 15.00)</option>
                        </select>
                      </div>
                      <div className="flex justify-between mt-1 text-[11px] text-muted-foreground border-b border-white/5 pb-2">
                        <span>Costo de envío:</span>
                        <span className="font-semibold text-foreground">{formatPEN(currentShippingCost)}</span>
                      </div>`;
text = text.replace(shalomRegex, shalomNew);


fs.writeFileSync(file, text, 'utf8');