const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /React\.useEffect\(\(\) => \{\r?\n\s*if \(\!auction\?\.id\) return\r?\n\s*const chatChannel = supabase\.channel\(\`chat_\$\{id\}\`\)\r?\n\s*chatChannel\.on\('broadcast', \{ event: 'new_message' \}, \(payload\) => \{\r?\n\s*setChat\(\(prev\) => \[\.\.\.prev, payload\.payload\]\)\r?\n\s*\}\)\.subscribe\(\)\r?\n\r?\n\s*const channel = supabase\r?\n\s*\.channel\(\`auction_\$\{safeAuction\.id\}\`\)/;

const newBlock = `React.useEffect(() => {
      // Chat Realtime (Always active)
      const chatChannel = supabase.channel(\`chat_\${id}\`)
      chatChannel.on('broadcast', { event: 'new_message' }, (payload) => {
        setChat((prev) => {
          // prevent duplicates if it's our own message bouncing back
          if (prev.find(m => m.id === payload.payload.id)) return prev;
          return [...prev, payload.payload]
        })
      }).subscribe()

      // Auction Realtime (Only if auction exists)
      let auctionChannel = null
      if (auction?.id) {
        auctionChannel = supabase.channel(\`auction_\${safeAuction.id}\`)
`;

if (regex.test(text)) {
    text = text.replace(regex, newBlock);
} else {
    console.log('Regex 1 failed');
}


const regex2 = /\.subscribe\(\)\r?\n\s*return \(\) => \{ supabase\.removeChannel\(channel\); supabase\.removeChannel\(chatChannel\); \}\r?\n\s*\}, \[auction\?\.id, supabase\]\)/;
const newBlock2 = `.subscribe()
      }

      return () => { 
        supabase.removeChannel(chatChannel);
        if (auctionChannel) supabase.removeChannel(auctionChannel); 
      }
    }, [auction?.id, id, supabase])`;

if (regex2.test(text)) {
    text = text.replace(regex2, newBlock2);
} else {
    console.log('Regex 2 failed');
}


fs.writeFileSync(file, text, 'utf8');
console.log('Fixed chat channel useEffect');