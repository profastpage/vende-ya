const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\productos\\[id]\\ProductDetailsClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const targetSig = `export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)`;

const replacementSig = `export default function ProductDetailsClient({ product, seller, reviews }: { product: any, seller: any, reviews: any[] }) {`;

code = code.replace(targetSig, replacementSig);

const targetMockData = `const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const seller = MOCK_PROFILES.find((p) => p.id === product.sellerId)
  if (!seller) notFound()`;

const replacementMockData = `const mappedReviews = reviews.length > 0 ? reviews.map(r => ({
    id: r.id,
    name: r.reviewer?.displayName || 'Usuario',
    avatar: r.reviewer?.avatarUrl,
    rating: r.rating,
    date: timeAgoEs(new Date(r.createdAt)),
    text: r.comment || '',
    verified: true
  })) : MOCK_REVIEWS;`;

code = code.replace(targetMockData, replacementMockData);

// Remove uses of MOCK_REVIEWS map and use mappedReviews
code = code.replace(/MOCK_REVIEWS\.map\(\(review\)/g, `mappedReviews.map((review)`);

// Rename function name just in case
code = code.replace(/export default function ProductDetailPage/, 'export default function ProductDetailsClient');

fs.writeFileSync(file, code, 'utf8');