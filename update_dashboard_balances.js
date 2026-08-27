const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex1 = /<p className="text-muted-foreground uppercase tracking-wider font-bold text-\[10px\]">Neto<\/p>\n\s*<p className="font-black text-lime-400 tabular-nums">\{formatPEN\(summary\.totalNet\)\}<\/p>/;
const replacement1 = `<p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Disponible (Retiro)</p>
                      <p className="font-black text-lime-400 tabular-nums">{formatPEN(data.escrow.availableBalance)}</p>
                      {data.escrow.availableBalance > 0 && (
                        <button onClick={() => alert("Retiro en desarrollo")} className="mt-2 w-full text-[10px] font-bold bg-lime-500/20 text-lime-400 border border-lime-500/30 py-1 rounded-md hover:bg-lime-500/30 transition-colors">Retirar</button>
                      )}`;
text = text.replace(regex1, replacement1);

const regex2 = /<p className="text-muted-foreground uppercase tracking-wider font-bold text-\[10px\]">Escrow<\/p>\n\s*<p className="font-black text-amber-600 dark:text-amber-400 \n*tabular-nums">\{formatPEN\(summary\.pendingEscrow\)\}<\/p>/;
const replacement2 = `<p className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Retenido (Escrow)</p>
                      <p className="font-black text-amber-600 dark:text-amber-400 tabular-nums">{formatPEN(data.escrow.frozenBalance)}</p>`;
text = text.replace(regex2, replacement2);

fs.writeFileSync(file, text, 'utf8');