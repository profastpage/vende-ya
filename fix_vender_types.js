const fs = require('fs');
const path = require('path');

const pagePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(pagePath, 'utf8');

// Fix type Mode
text = text.replace(/type Mode = 'quick' \| 'live' \| 'ai'/g, "type Mode = 'marketplace' | 'live_shopping' | 'live_auction'");

// We need to fix conditions inside the component.
// e.g. const isLive = mode === 'live' -> const isLive = mode === 'live_shopping' || mode === 'live_auction'
text = text.replace(/const isLive = mode === 'live'/g, "const isLive = mode === 'live_shopping' || mode === 'live_auction'");

// e.g. const isAuction = mode === 'quick' || mode === 'live' -> const isAuction = mode === 'live_auction'
text = text.replace(/const isAuction = mode === 'quick' \|\| mode === 'live'/g, "const isAuction = mode === 'live_auction'");

text = text.replace(/mode === 'live'/g, "mode === 'live_shopping'");
text = text.replace(/mode === 'quick'/g, "mode === 'marketplace'");
text = text.replace(/mode === 'ai'/g, "mode === 'live_auction'");
text = text.replace(/mode !== 'live'/g, "mode === 'marketplace'");

// Also `initialMode: Mode = 'quick'` -> `initialMode: Mode = 'marketplace'`
text = text.replace(/initialMode = 'quick'/g, "initialMode = 'marketplace'");
text = text.replace(/initialMode: Mode = 'quick'/g, "initialMode: Mode = 'marketplace'");

fs.writeFileSync(pagePath, text, 'utf8');
console.log('Fixed typescript modes');