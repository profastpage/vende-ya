const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vendedores\\[username]\\SellerProfileClient.tsx');
let code = fs.readFileSync(file, 'utf8');

// Replace component signature
const targetSig = `export default function SellerProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params)`;
  
const replacementSig = `export default function SellerProfileClient({ seller, activeStream, pastStreams, products, reviews }: { 
  seller: any; 
  activeStream: any; 
  pastStreams: any[]; 
  products: any[]; 
  reviews: any[] 
}) {`;

code = code.replace(targetSig, replacementSig);

// Replace fake data fetching
const targetFakeData = `const seller = MOCK_PROFILES.find((p) => p.username === username)
  if (!seller) notFound()

  const sellerProducts = MOCK_PRODUCTS.filter((p) => p.sellerId === seller.id)
  const sellerAuctions = MOCK_TRENDING_AUCTIONS.filter((a) => a.sellerId === seller.id)
  const activeAuctions = sellerAuctions.filter((a) => a.status === 'live')`;

const replacementFakeData = `const sellerProducts = products;
  const sellerAuctions = pastStreams; // We reuse this array for the UI tab "Historial"
  const activeAuctions = activeStream ? [activeStream] : [];
  
  // Convert DB reviews to UI format
  const mappedReviews = reviews.length > 0 ? reviews.map(r => ({
    id: r.id,
    name: r.reviewer?.displayName || 'Usuario',
    avatar: r.reviewer?.avatarUrl,
    rating: r.rating,
    date: timeAgoEs(new Date(r.createdAt)),
    text: r.comment || '',
    productTitle: r.order?.items?.[0]?.product?.title || 'Producto'
  })) : SELLER_REVIEWS; // Fallback to SELLER_REVIEWS just for UI presentation if empty
  `;

code = code.replace(targetFakeData, replacementFakeData);

// Remove SELLER_REVIEWS map in UI and use mappedReviews
code = code.replace(/SELLER_REVIEWS\.map\(\(review\)/g, `mappedReviews.map((review)`);

// Rename function name just in case
code = code.replace(/export default function SellerProfilePage/, 'export default function SellerProfileClient');

fs.writeFileSync(file, code, 'utf8');