const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Title dynamically
text = text.replace(
  /<h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">Detalles del producto<\/h2>/,
  '<h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">{isLive ? "Detalles de la transmisión" : "Detalles del producto"}</h2>'
);

text = text.replace(
  /<p className="text-sm text-muted-foreground mb-4">[\s\S]*?<\/p>/,
  '<p className="text-sm text-muted-foreground mb-4">{isLive ? "Ingresa un título para tu transmisión en vivo y el precio base del artículo que ofrecerás." : "Completa los campos obligatorios marcados con asterisco. Las fotos son la primera impresión del comprador."}</p>'
);

// Conditionally render description
text = text.replace(
  /<div className="space-y-2">\s*<Label htmlFor="description"/,
  '{!isLive && (\n              <div className="space-y-2">\n                <Label htmlFor="description"'
);
text = text.replace(
  /<\/Textarea>\s*<\/div>\s*<div className="grid grid-cols-2 gap-3">/,
  '</Textarea>\n              </div>\n              )}\n\n              <div className={`grid ${isLive ? "grid-cols-1" : "grid-cols-2"} gap-3`}>'
);

// Conditionally render stock
text = text.replace(
  /<div className="space-y-2">\s*<Label htmlFor="stock"/,
  '{!isLive && (\n                <div className="space-y-2">\n                  <Label htmlFor="stock"'
);
text = text.replace(
  /id="stock" type="number" min="1"[\s\S]*?<\/div>\s*<\/div>\s*<div className="grid grid-cols-2 gap-3">/,
  'id="stock" type="number" min="1"\n                    value={stock} onChange={(e) => setStock(e.target.value)}\n                    className="h-12 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"\n                  />\n                </div>\n                )}\n              </div>\n\n              {!isLive && (\n              <div className="grid grid-cols-2 gap-3">'
);

// Conditionally close Category & Condition grid
text = text.replace(
  /<\/select>\s*<\/div>\s*<\/div>\s*\{\/\* Photos \*\/\}/,
  '</select>\n                </div>\n              </div>\n              )}\n\n              {/* Photos */}'
);

// Conditionally render Photos
text = text.replace(
  /\{\/\* Photos \*\/\}\s*<div className="space-y-2">/,
  '{/* Photos */}\n              {!isLive && (\n              <div className="space-y-2">'
);
text = text.replace(
  /<\/button>\s*<\/div>\s*<\/div>\s*<div className="pt-4 border-t border-border">/,
  '</button>\n                </div>\n              </div>\n              )}\n\n              <div className="pt-4 border-t border-border">'
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed form conditional rendering');