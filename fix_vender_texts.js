const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace dark mode text colors
text = text.replace(/text-amber-900 dark:text-amber-200/g, 'text-amber-100');
text = text.replace(/text-amber-800 dark:text-amber-200\/80/g, 'text-amber-200/90');
text = text.replace(/text-amber-700 dark:text-amber-200\/60/g, 'text-amber-300/60');
text = text.replace(/text-lime-200\/70/g, 'text-lime-100/90');
text = text.replace(/text-lime-200\/80/g, 'text-lime-100');
text = text.replace(/text-lime-200/g, 'text-lime-400'); // make the title brighter

// Add file input logic for Cover Image
const fileInputReplacement = `                    <label className="aspect-square rounded-lg border-2 border-dashed border-amber-400/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted hover:border-amber-400 transition-colors cursor-pointer bg-amber-400/5">
                      <ImageIcon className="h-6 w-6 text-amber-400/70" />
                      <span className="text-xs font-semibold text-amber-400">Portada *</span>
                      <input type="file" accept="image/*" className="hidden" required />
                    </label>`;

text = text.replace(/<button[\s\S]*?className="aspect-square rounded-lg border-2 border-dashed border-border[\s\S]*?<ImageIcon className="h-6 w-6" \/>[\s\S]*?<span className="text-xs">Subir<\/span>[\s\S]*?<\/button>/, fileInputReplacement);

fs.writeFileSync(file, text, 'utf8');