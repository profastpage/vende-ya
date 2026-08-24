const fs = require('fs');
const path = require('path');

const dashPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
if (fs.existsSync(dashPath)) {
  let text = fs.readFileSync(dashPath, 'utf8');

  text = text.replace(
    /bg-amber-400\/5/g,
    "bg-amber-50 dark:bg-amber-400/5"
  );
  text = text.replace(
    /border-amber-400\/20/g,
    "border-amber-200 dark:border-amber-400/20"
  );
  text = text.replace(
    /text-amber-300/g,
    "text-amber-700 dark:text-amber-300"
  );
  text = text.replace(
    /text-amber-400/g,
    "text-amber-600 dark:text-amber-400"
  );
  text = text.replace(
    /text-amber-500/g,
    "text-amber-600 dark:text-amber-500"
  );

  text = text.replace(
    /bg-zinc-950\/40/g,
    "bg-zinc-50 dark:bg-zinc-950/40"
  );
  text = text.replace(
    /border-zinc-800/g,
    "border-zinc-200 dark:border-zinc-800"
  );
  text = text.replace(
    /border-white\/5/g,
    "border-zinc-200 dark:border-white/5"
  );

  // Activity cards
  text = text.replace(
    /bg-black\/20/g,
    "bg-zinc-100 dark:bg-black/20"
  );

  fs.writeFileSync(dashPath, text, 'utf8');
  console.log('Fixed dashboard page');
}