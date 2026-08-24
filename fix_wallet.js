const fs = require('fs');
const path = require('path');

const walletPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\wallet\\page.tsx');
if (fs.existsSync(walletPath)) {
  let text = fs.readFileSync(walletPath, 'utf8');

  // Fix MP Card Container (Yellow border/bg)
  text = text.replace(
    /bg-amber-400\/5 border border-amber-400\/20/g,
    "bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20"
  );

  // Fix text-amber-300 (which is invisible in light mode)
  text = text.replace(
    /text-amber-300/g,
    "text-amber-700 dark:text-amber-300"
  );
  
  // text-amber-400
  text = text.replace(
    /text-amber-400/g,
    "text-amber-600 dark:text-amber-400"
  );

  // text-amber-500
  text = text.replace(
    /text-amber-500/g,
    "text-amber-600 dark:text-amber-500"
  );

  // Muted foregrounds inside yellow cards
  text = text.replace(
    /<p className="text-sm text-muted-foreground max-w-xl">/g,
    '<p className="text-sm text-amber-900/70 dark:text-muted-foreground max-w-xl">'
  );
  text = text.replace(
    /text-muted-foreground max-w-xl/g,
    'text-amber-900/70 dark:text-muted-foreground max-w-xl'
  );

  // Verification Pending card
  text = text.replace(
    /bg-blue-950\/20 border-blue-900\/50/g,
    "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
  );
  
  // Connect Instructions
  text = text.replace(
    /bg-zinc-950\/40 border-zinc-900/g,
    "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900"
  );
  
  // Step circles
  text = text.replace(
    /bg-amber-400\/10 text-amber-400/g,
    "bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400"
  );
  
  // Dashboard card borders and bgs
  text = text.replace(
    /bg-zinc-950\/50 border-white\/5/g,
    "bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-white/5"
  );

  fs.writeFileSync(walletPath, text, 'utf8');
  console.log('Fixed wallet page');
}