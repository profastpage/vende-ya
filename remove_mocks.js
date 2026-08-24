const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace chat initialization
text = text.replace(/const \[chat, setChat\] = React\.useState<ChatMessage\[\]>\(INITIAL_CHAT\)/, 'const [chat, setChat] = React.useState<ChatMessage[]>([])');

// Remove INITIAL_CHAT block
text = text.replace(/const INITIAL_CHAT: ChatMessage\[\] = \[[\s\S]*?\]\r?\n/, '');

// Replace MOCK_BIDS logic with an empty array state (or just empty array for now)
text = text.replace(/const \[bidCount, setBidCount\] = React\.useState\(safeAuction\.bidCount \|\| MOCK_BIDS\.length\)/, 'const [bidCount, setBidCount] = React.useState(safeAuction.bidCount || 0); const [bids, setBids] = React.useState([]);');

// Replace {MOCK_BIDS.length}
text = text.replace(/\{MOCK_BIDS\.length\}/g, '{bidCount}');

// Replace MOCK_BIDS.slice().reverse().map...
text = text.replace(/\{MOCK_BIDS\.slice\(\)\.reverse\(\)\.map\(\(b\) => \(/g, '{bids.slice().reverse().map((b: any) => (');

// Remove the import of MOCK_BIDS and MOCK_STREAMS etc from LiveRoomClient.tsx
text = text.replace(/MOCK_STREAMS, MOCK_AUCTION, MOCK_BIDS,\r?\n\s*MOCK_PROFILES, MOCK_TRENDING_AUCTIONS,/, '');

fs.writeFileSync(file, text, 'utf8');
console.log('Removed MOCK_BIDS and INITIAL_CHAT from LiveRoomClient');