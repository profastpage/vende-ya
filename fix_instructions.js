const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace everything between <div className="rounded-xl bg-muted border border-border p-4 text-sm"> and </div>
text = text.replace(/<div className="rounded-xl bg-muted border border-border p-4 text-sm">[\s\S]*?<\/div>/,
`<div className="rounded-xl bg-muted border border-border p-4 text-sm">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      🎥 Cómo transmitir con YouTube
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                      <li>Inicia transmisión desde tu app de YouTube o PC.</li>
                      <li><strong className="text-amber-500">👉 RECOMENDACIÓN:</strong> Transmite en vertical (Shorts) o en horizontal, Vende Ya se adaptará automáticamente.</li>
                      <li>Toca en "Compartir" y copia el enlace.</li>
                      <li>Pega el enlace de YouTube aquí abajo para enlazar tu producto al instante.</li>
                    </ol>
                  </div>`);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed instructions');