const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix Infinite Loop (useMemo for supabase)
text = text.replace(/const supabase = createBrowserClient\([\s\S]*?\)/,
`const supabase = React.useMemo(() => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), [])`);

// 2. Fix Mobile Layout Flexbox
const mobileBlockRegex = /\{\/\* Product \/ Bidding \/ Chat Section \*\/\}\s*<div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">/g;
text = text.replace(mobileBlockRegex, `{/* Product / Bidding / Chat Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">`);

// 3. Fix the Twitch Date.now() key in DynamicLivePlayer.tsx
const playerFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let playerText = fs.readFileSync(playerFile, 'utf8');
playerText = playerText.replace(/key=\{\`twitch-\$\{providerId\}-\$\{Date\.now\(\)\}\`\}/g, `key={\`twitch-\${providerId}\`}`);
fs.writeFileSync(playerFile, playerText, 'utf8');

fs.writeFileSync(file, text, 'utf8');