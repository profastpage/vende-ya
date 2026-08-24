const fs = require('fs');
const path = require('path');

const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// The modes block
const modesBlock = `
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ModeCard
                active={mode === 'marketplace'}
                onClick={() => setMode('marketplace')}
                icon={Tag}
                title="Vender en Marketplace"
                desc="Venta estática a precio fijo"
                color="text-amber-400"
              />
              <ModeCard
                active={mode === 'live_shopping'}
                onClick={() => setMode('live_shopping')}
                icon={Video}
                title="Live Shopping"
                desc="Vende en vivo a precio fijo (Stock)"
                color="text-fuchsia-400"
              />
              <ModeCard
                active={mode === 'live_auction'}
                onClick={() => setMode('live_auction')}
                icon={Sparkles}
                title="Subasta en Vivo"
                desc="Transmite y subasta al mejor postor"
                color="text-purple-400"
              />
            </div>
`;

// Replace the grid block (very loose regex)
text = text.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-3">[\s\S]*?<\/div>\s*<\/section>/, modesBlock.trim() + '\n          </section>');

// Fix Cloudflare mentions
text = text.replace(/Los espectadores pujan en tiempo real con latencia menor a 2 segundos v[^\s]+ Cloudflare Stream\./g, "Tus compradores te ven en tiempo real y sin latencia. Interacción 100% directa.");
text = text.replace(/Los viewers ven el stream con ~2s de latencia v[^\s]+ Cloudflare Stream y pueden pujar en vivo\./g, "Tus seguidores podrán ver tu transmisión en tiempo real y comprar directamente desde la app.");

// Also fix some corrupted accents just in case
text = text.replace(/c\xEF\xBF\xBDmara|c\xC7\xADmara|cǭmara/g, 'cámara');
text = text.replace(/r\xEF\xBF\xBDpida|r\xC7\xADpida|rǭpida/g, 'rápida');
text = text.replace(/esttica/g, 'estática');

fs.writeFileSync(pagePath, text, 'utf8');