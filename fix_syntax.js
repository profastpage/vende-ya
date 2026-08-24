const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// The issue is I injected {!isLive && ( ... but didn't close it because Textarea was self-closing.
// Let's fix the first one (Description):
text = text.replace(
  /\{\!isLive && \(\s*<div className="space-y-2">\s*<Label htmlFor="description"[\s\S]*?\/>\s*<\/div>/,
  '{!isLive && (\n              <div className="space-y-2">\n                <Label htmlFor="description" className="text-muted-foreground">Descripción</Label>\n                <Textarea\n                  id="description" rows={4}\n                  placeholder="Describe materiales, tallas, colores disponibles, condición, etc."\n                  value={description} onChange={(e) => setDescription(e.target.value)}\n                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-400/40"\n                />\n              </div>\n            )}'
);

// Fix Photos missing closing brace
text = text.replace(
  /\{\/\* Photos \*\/\}\s*\{\!isLive && \(\s*<div className="space-y-2">\s*<Label className="text-muted-foreground">Fotos<\/Label>[\s\S]*?<p className="text-xs text-muted-foreground">Hasta 8 fotos\. Primera foto = portada\.<\/p>\s*<\/div>/,
  '{/* Photos */}\n            {!isLive && (\n              <div className="space-y-2">\n                <Label className="text-muted-foreground">Fotos</Label>\n                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">\n                  <button\n                    type="button"\n                    className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted hover:border-amber-400/40 transition-colors"\n                  >\n                    <ImageIcon className="h-6 w-6" />\n                    <span className="text-xs">Subir</span>\n                  </button>\n                  {[1, 2].map((i) => (\n                    <div\n                      key={i}\n                      className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground"\n                    >\n                      Foto {i}\n                    </div>\n                  ))}\n                </div>\n                <p className="text-xs text-muted-foreground">Hasta 8 fotos. Primera foto = portada.</p>\n              </div>\n            )}'
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed syntax errors');