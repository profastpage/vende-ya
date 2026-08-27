const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<span className="text-\[10px\] text-muted-foreground capitalize">\s*\{o\.paymentMethod\.replace\('_', ' '\)\}\s*<\/span>\s*<\/div>/;

const replacement = `<span className="text-[10px] text-muted-foreground capitalize">
                    {o.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                {o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && (
                  <div className="mt-2 text-right">
                    <button onClick={async () => {
                      if(confirm("¿Confirmas que el producto ha sido entregado al comprador? Los fondos pasarán de Escrow a Disponible.")) {
                        try {
                          const { markOrderAsDelivered } = await import('@/app/actions/logistics');
                          await markOrderAsDelivered(o.id);
                          alert('¡Orden completada! Fondos liberados.');
                          window.location.reload();
                        } catch(e) {
                          alert('Error: ' + e.message);
                        }
                      }
                    }} className="text-[10px] font-bold bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors">
                      Marcar Entregado
                    </button>
                  </div>
                )}`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');