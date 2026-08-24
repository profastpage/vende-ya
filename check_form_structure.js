const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Change Section Title dynamically
text = text.replace(
  /<h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">Detalles del producto<\/h2>/,
  '<h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-1">{isLive ? "Detalles de la transmisión" : "Detalles del producto"}</h2>'
);

text = text.replace(
  /<p className="text-sm text-muted-foreground mb-4">[\s\S]*?<\/p>/,
  '<p className="text-sm text-muted-foreground mb-4">{isLive ? "Ingresa el título de tu stream y el precio base del producto a vender." : "Completa los campos obligatorios. Las fotos son la primera impresión del comprador."}</p>'
);

// Conditionally hide Description
text = text.replace(
  /<div className="space-y-2">\s*<Label htmlFor="description" className="text-muted-foreground">Descripción<\/Label>/,
  '{!isLive && (<div className="space-y-2">\n                  <Label htmlFor="description" className="text-muted-foreground">Descripción</Label>'
);
text = text.replace(
  /<\/Textarea>\s*<\/div>\s*<div className="grid grid-cols-2 gap-3">/,
  '</Textarea>\n                </div>)}\n\n              <div className="grid grid-cols-2 gap-3">'
);

// Conditionally hide Condition, Category, Stock, Payment Methods, Shipping
// These are grouped under <div className="pt-4 border-t border-border"> or similar? Let's check the structure.