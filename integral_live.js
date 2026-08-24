const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// 1. Fix the description text that failed due to newlines
const oldTextRegex = /<p className="text-sm text-muted-foreground mb-4">[\s\S]*?Las fotos son la primera impresi\S+ del comprador[\s\S]*?<\/p>/;
const newText = `<p className="text-sm text-muted-foreground mb-4">
              {isLive 
                ? "Ingresa el título de tu transmisión en vivo y el precio base del artículo que ofrecerás." 
                : "Completa los campos obligatorios marcados con asterisco. Las fotos son la primera impresión del comprador: usa luz natural y muestra detalles del producto."}
            </p>`;
text = text.replace(oldTextRegex, newText);

// 2. Hide Payment Methods & Shipping for Live mode (Zero friction!)
const paymentRegex = /\{\/\* Payment methods \*\/\}\s*<div className="space-y-2">/;
text = text.replace(paymentRegex, '{!isLive && (\n            <>\n            {/* Payment methods */}\n            <div className="space-y-2">');

const shippingRegex = /<\/div>\s*<Button\s*onClick=\{handleSubmit\}/;
text = text.replace(shippingRegex, '</div>\n            </>\n            )}\n\n            <Button\n              onClick={handleSubmit}');

// 3. Fix the empty Auction box
// Currently it is:
// <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
//   {isAuction && ( ... )}
// </div>
// It leaves an empty grey box if isAuction is false.
text = text.replace(
  /<div className="rounded-xl border border-border bg-muted p-4 space-y-3">\s*\{isAuction && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>/,
  `{isAuction && (
              <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 pl-2">
                  <div className="space-y-2">
                    <Label htmlFor="starting" className="text-muted-foreground">Precio inicial (S/.)</Label>
                    <Input
                      id="starting" type="number" min="1" step="1"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className="h-10 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-muted-foreground">Duración</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full h-10 rounded-md border border-border bg-muted px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    >
                      <option value="60" className="bg-card">1 minuto</option>
                      <option value="180" className="bg-card">3 minutos</option>
                      <option value="300" className="bg-card">5 minutos</option>
                      <option value="600" className="bg-card">10 minutos</option>
                      <option value="1800" className="bg-card">30 minutos</option>
                    </select>
                  </div>
                </div>
              </div>
            )}`
);

// 4. Update the Button text
// From: {isAuction ? '🎉 Iniciar subasta' : '📦 Publicar producto'}
// To: {isAuction ? '🎉 Iniciar Subasta en Vivo' : isLive ? '🎥 Empezar Live Shopping' : '📦 Publicar en Marketplace'}
text = text.replace(
  /\{isAuction \? '.*?' : '.*?'\} <ArrowRight/,
  "{isAuction ? '🎉 Iniciar Subasta en Vivo' : isLive ? '🎥 Empezar Live Shopping' : '📦 Publicar en Marketplace'} <ArrowRight"
);


fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed integral live shopping UI');