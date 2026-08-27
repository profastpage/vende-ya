const fs = require('fs');
const path = require('path');

// 1. Fix LayoutClientWrapper padding
const wrapperFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\LayoutClientWrapper.tsx');
let wrapperText = fs.readFileSync(wrapperFile, 'utf8');
wrapperText = wrapperText.replace(
  /pb-24/g,
  `pb-32`
);
fs.writeFileSync(wrapperFile, wrapperText, 'utf8');

// 2. Fix MarketplaceGrid colors
const gridFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MarketplaceGrid.tsx');
let gridText = fs.readFileSync(gridFile, 'utf8');
gridText = gridText.replace(/text-zinc-900/g, 'text-foreground');
gridText = gridText.replace(/text-zinc-500/g, 'text-muted-foreground');
fs.writeFileSync(gridFile, gridText, 'utf8');

// 3. Fix SocialVideoFeed layout and Share button
const feedFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let feedText = fs.readFileSync(feedFile, 'utf8');

// add toast import
feedText = feedText.replace(
  /import \{ formatPEN \} from '@\/lib\/vendeda\/format'/,
  "import { formatPEN } from '@/lib/vendeda/format'\nimport { toast } from 'sonner'"
);

// fix share button toast
feedText = feedText.replace(
  /\/\/ toast\("Enlace copiado"\)/g,
  `toast.success("Enlace copiado al portapapeles")`
);

// fix live comments
feedText = feedText.replace(
  /<div className="h-32 overflow-y-auto no-scrollbar pointer-events-none space-y-2 mt-2" style=\{\{ maskImage: 'linear-gradient\(to top, black 50%, transparent 100%\)', WebkitMaskImage: 'linear-gradient\(to top, black 50%, transparent 100%\)' \}\}>/g,
  `<div className="h-20 overflow-y-hidden pointer-events-none space-y-1.5 mt-2" style={{ maskImage: 'linear-gradient(to top, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)' }}>`
);

feedText = feedText.replace(
  /\{item\.liveComments\.map\(comment => \(/g,
  `{item.liveComments.slice(0, 3).map(comment => (`
);

feedText = feedText.replace(
  /<div key=\{comment\.id\} className="text-sm">/g,
  `<div key={comment.id} className="text-[12px] leading-tight">`
);

fs.writeFileSync(feedFile, feedText, 'utf8');