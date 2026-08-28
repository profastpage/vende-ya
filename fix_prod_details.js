const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\productos\\[id]\\ProductDetailsClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `  const [activeTab, setActiveTab] = React.useState<TabId>('description')

  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const seller = MOCK_PROFILES.find((p) => p.id === product.sellerId)
  if (!seller) notFound()

  const related = MOCK_PRODUCTS
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 6)`;

const replacement = `  const [activeTab, setActiveTab] = React.useState<TabId>('description')

  const mappedReviews = reviews.length > 0 ? reviews.map(r => ({
    id: r.id,
    name: r.reviewer?.displayName || 'Usuario',
    avatar: r.reviewer?.avatarUrl,
    rating: r.rating,
    date: timeAgoEs(new Date(r.createdAt)),
    text: r.comment || '',
    verified: true
  })) : MOCK_REVIEWS;
  
  const related = [] // Related is empty for now since we haven't fetched it, we can just hide it or leave empty array`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code, 'utf8');
} else {
  // alternative target
  const altTarget = `  const [activeTab, setActiveTab] = React.useState<TabId>('description')

  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) notFound()

  const seller = product.seller
  const related = MOCK_PRODUCTS
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 6)`;
    
  if(code.includes(altTarget)) {
    code = code.replace(altTarget, replacement);
    fs.writeFileSync(file, code, 'utf8');
  } else {
    console.log("NOT FOUND");
  }
}