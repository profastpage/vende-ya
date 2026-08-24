const fs = require('fs');
const path = require('path');

const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Replace the old block
const oldBlockRegex = /\{\/\* "\?"\?"\? Live stream setup "\?"\?"\? \*\/\}[\s\S]*?<\/motion\.section>\s*\)\}/;

const newBlock = `{/* 🎥 Live stream setup 🎥 */}
          {isLive && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
                  <Video className="h-4 w-4 text-rose-400" />
                </div>
                <h3 className="font-bold text-foreground">Conecta tu transmisión en vivo</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-muted border border-border p-4 text-sm">
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    📱 Cómo transmitir con Kick
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Descarga la app de Kick en tu celular o usa OBS Studio en PC.</li>
                    <li>Inicia transmisión desde tu cuenta de Kick.</li>
                    <li>Ingresa tu usuario exacto de Kick abajo para enlazar el stream a tu producto.</li>
                    <li>¡Tus seguidores verán el video embebido y podrán comprar sin salir de Vende Ya!</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kickUser" className="text-foreground font-semibold">Usuario de Kick *</Label>
                  <Input 
                    id="kickUser" 
                    placeholder="Ej. mi_canal_oficial" 
                    value={kickUsername}
                    onChange={(e) => setKickUsername(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>
              </div>
            </motion.section>
          )}`;

if (oldBlockRegex.test(text)) {
  text = text.replace(oldBlockRegex, newBlock);
} else {
  // If regex fails due to emojis, replace using a simpler string replacement
  const oldText = `          {/* 🔴🔴🔴 Live stream setup 🔴🔴🔴 */}
          {mode === 'live_shopping' && (`
  
  const startIdx = text.indexOf(oldText);
  if (startIdx > -1) {
     const endStr = `            </motion.section>
          )}`;
     const endIdx = text.indexOf(endStr, startIdx);
     if (endIdx > -1) {
        text = text.substring(0, startIdx) + newBlock + text.substring(endIdx + endStr.length);
     }
  } else {
     // Fallback for weird emoji encoding
     const fallbackRegex = /\{\/\*.*Live stream setup.*\*\/\}\s*\{mode === 'live_shopping' && \([\s\S]*?<\/motion\.section>\s*\)\}/;
     text = text.replace(fallbackRegex, newBlock);
  }
}

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed stream setup box');