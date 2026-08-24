const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace map internal to add the button
const target = `<div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Neto a recibir
                    </span>
                    <span className="text-xs font-bold text-lime-400">
                      {formatPEN(o.sellerNetAmount)}
                    </span>
                  </div>`;

const replacement = `<div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Neto a recibir
                    </span>
                    <div className="flex items-center gap-2">
                      {((o as any).shipment?.shipmentStatus === 'delivered' || o.paymentStatus === 'released') && !(o as any).review && (
                        <button className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded">
                          Calificar Transacción
                        </button>
                      )}
                      <span className="text-xs font-bold text-lime-400">
                        {formatPEN(o.sellerNetAmount)}
                      </span>
                    </div>
                  </div>`;

if (text.includes(target)) {
    text = text.replace(target, replacement);
    fs.writeFileSync(file, text, 'utf8');
    console.log('Added Calificar button to orders');
} else {
    console.log('Target not found, trying fallback regex');
    
    // Alternative fallback if exact string doesn't match
    const regex = /<span className="text-xs font-bold text-lime-400">\s*\{formatPEN\(o\.sellerNetAmount\)\}\s*<\/span>/;
    text = text.replace(regex, `
                      {((o as any).shipment?.shipmentStatus === 'delivered' || o.paymentStatus === 'released') && !(o as any).review && (
                        <button className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold rounded">
                          Calificar
                        </button>
                      )}
                      <span className="text-xs font-bold text-lime-400">
                        {formatPEN(o.sellerNetAmount)}
                      </span>
    `);
    fs.writeFileSync(file, text, 'utf8');
    console.log('Used fallback regex');
}