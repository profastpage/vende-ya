const fs = require('fs');
const path = require('path');
const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

text = text.replace(
  /const initialMode = \(searchParams\.get\('mode'\) as Mode\) \?\? 'quick'/g,
  "const initialMode = (searchParams.get('mode') as Mode) ?? 'marketplace'"
);

text = text.replace(
  /const \[mode, setMode\] = React\.useState<Mode>\(initialMode\)/g,
  "const [mode, setMode] = React.useState<Mode>(initialMode)\n  const isAuction = mode === 'live_auction'\n  const isLive = mode === 'live_shopping' || mode === 'live_auction'"
);

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Injected isAuction and isLive');