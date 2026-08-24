const fs = require('fs');
const path = require('path');

const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Replace Modes
text = text.replace(/mode === 'quick'/g, "mode === 'marketplace'");
text = text.replace(/setMode\('quick'\)/g, "setMode('marketplace')");
text = text.replace(/title="Subasta rpida"/g, 'title="Marketplace"');
text = text.replace(/desc="Publica y subasta en 3 minutos"/g, 'desc="Venta esttica a precio fijo"');

text = text.replace(/mode === 'live'/g, "mode === 'live_shopping'");
text = text.replace(/setMode\('live'\)/g, "setMode('live_shopping')");
text = text.replace(/title="Subastar en vivo"/g, 'title="Live Shopping"');
text = text.replace(/desc="Conecta tu cmara y subasta en directo"/g, 'desc="Vende en vivo a precio fijo"');

text = text.replace(/mode === 'ai'/g, "mode === 'live_auction'");
text = text.replace(/setMode\('ai'\)/g, "setMode('live_auction')");
text = text.replace(/title="Extraer con IA"/g, 'title="Subasta en Vivo"');
text = text.replace(/desc="Describe y la IA arma el listing"/g, 'desc="Transmite y subasta al mejor postor"');
text = text.replace(/Extraer con IA/g, 'Subasta en Vivo');

// Cloudflare Stream replacements
text = text.replace(
  /Los espectadores pujan en tiempo real con latencia menor a 2 segundos va Cloudflare Stream\./g,
  "Tus compradores te ven en tiempo real y sin latencia. Interaccin 100% directa en la plataforma."
);
text = text.replace(
  /Los viewers ven el stream con ~2s de latencia va Cloudflare Stream y pueden pujar en vivo\./g,
  "Tus seguidores podrn ver tu transmisin en tiempo real y comprar directamente desde la app."
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed vender page modes');