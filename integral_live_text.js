const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

const regex = /<p className="text-sm text-muted-foreground mb-4">\s*Completa los campos obligatorios[\s\S]*?muestra detalles del producto\.\s*<\/p>/;
const newText = `<p className="text-sm text-muted-foreground mb-4">
            {isLive 
              ? "Ingresa el título de tu transmisión en vivo y el precio base del artículo que ofrecerás." 
              : "Completa los campos obligatorios marcados con asterisco. Las fotos son la primera impresión del comprador: usa luz natural y muestra detalles del producto."}
          </p>`;
text = text.replace(regex, newText);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed text');