const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\CheckoutBottomSheet.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace container classes to force dark mode
text = text.replace(/bg-card border-t border-border rounded-t-3xl \n*z-50 p-6 pb-8 text-foreground/g, 
  "bg-zinc-950 border-t border-white/10 rounded-t-3xl z-50 p-6 pb-8 text-white");

// Replace foreground classes
text = text.replace(/text-foreground/g, "text-white");
text = text.replace(/text-muted-foreground/g, "text-zinc-400");
text = text.replace(/bg-muted\/80/g, "bg-zinc-900/80");
text = text.replace(/bg-muted/g, "bg-zinc-900");
text = text.replace(/hover:bg-accent/g, "hover:bg-zinc-800");

// Update the verified session box which looked ugly
text = text.replace(/bg-emerald-950\/30 border border-emerald-900\/50/g, "bg-emerald-500/10 border border-emerald-500/20");
text = text.replace(/bg-amber-950\/30 border border-amber-900\/50/g, "bg-amber-500/10 border border-amber-500/20");

fs.writeFileSync(file, text, 'utf8');