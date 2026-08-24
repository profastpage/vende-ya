const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Replace export
text = text.replace(
    /export default function StreamDetailPage\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/,
    `export default function LiveRoomClient({ stream, auction, product, seller }: { stream: any, auction: any, product: any, seller: any }) {`
);

// Remove the MOCK lookup logic and params logic
const oldLogic = `  const { id } = React.use(params)
  const router = useRouter()

  const stream = MOCK_STREAMS.find((s) => s.id === id)
  const auction: Auction = MOCK_TRENDING_AUCTIONS.find((a) => a.streamId === id) ?? MOCK_AUCTION
  const seller: Profile = stream?.seller ?? MOCK_PROFILES[0]
  const product: Product | undefined = auction.product`;

const newLogic = `  const router = useRouter()
  const id = stream?.id || 'demo'`;

text = text.replace(oldLogic, newLogic);

// Ensure it doesn't do if (!stream) notFound() since we do that in server component
text = text.replace(/if \(!stream\) notFound\(\)\r?\n/, '');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient.tsx');