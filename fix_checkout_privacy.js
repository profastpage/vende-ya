const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\CheckoutBottomSheet.tsx');
let text = fs.readFileSync(file, 'utf8');

const oldSummaryBlockRegex = /{\/\* Resumen del producto \+ split Modo A \*\/}[\s\S]*?{\/\* Indicador de sesión activa \*\/}/;

const newSummaryBlock = `{/* Resumen del producto para el Comprador */}
                  <div className="bg-muted rounded-2xl p-4 mb-5 border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {productName}
                      </span>
                      <span className="text-lg font-black text-amber-400">
                        {formatPEN(price)}
                      </span>
                    </div>
                    <div className="border-t border-border pt-3 text-xs text-muted-foreground flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Origen de compra:</span>
                        <b className="text-foreground uppercase">
                          {source === 'live_stream' ? 'Live Stream' : 'Marketplace'}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío:</span>
                        {shipment ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">
                            Gestionado por Shalom
                          </span>
                        ) : (
                          <span className="text-foreground font-semibold">Acordar con vendedor</span>
                        )}
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="font-bold text-foreground">Total a pagar:</span>
                        <span className="font-bold text-amber-400 text-sm">{formatPEN(price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador de sesión activa */}`;

text = text.replace(oldSummaryBlockRegex, newSummaryBlock);

fs.writeFileSync(file, text, 'utf8');