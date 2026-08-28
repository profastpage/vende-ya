const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vendedores\\[username]\\SellerProfileClient.tsx');
let code = fs.readFileSync(file, 'utf8');

const replacementFakeData = `const sellerProducts = products;
  // Map LiveStreams to the UI format expected by the Auctions tab
  const sellerAuctions = pastStreams.map(s => ({
    id: s.id,
    status: s.status,
    currentPrice: 0,
    title: s.title,
    product: { images: [s.thumbnailUrl || 'https://placehold.co/400x400/1a1a1a/333333.png?text=VOD'] }
  }));
  const activeAuctions = activeStream ? [{
    id: activeStream.id,
    status: 'live',
    currentPrice: 0,
    title: activeStream.title,
    product: { images: [activeStream.thumbnailUrl || 'https://placehold.co/400x400/1a1a1a/333333.png?text=LIVE'] }
  }] : [];
  
  const mappedReviews = reviews.length > 0 ? reviews.map(r => ({
    id: r.id,
    name: r.reviewer?.displayName || 'Usuario',
    avatar: r.reviewer?.avatarUrl,
    rating: r.rating,
    date: timeAgoEs(new Date(r.createdAt)),
    text: r.comment || '',
    productTitle: r.order?.items?.[0]?.product?.title || 'Producto'
  })) : SELLER_REVIEWS;
  `;
code = code.replace(/const sellerProducts = products;[\s\S]*?const mappedReviews[^;]+;/, replacementFakeData);

code = code.replace(/href=\{ROUTES\.auction\(a\.id\)\}/g, `href={a.status === 'live' ? \`/en-vivo/\${seller.username}\` : '#'}`);
code = code.replace(/\{formatPEN\(a\.currentPrice\)\}/g, `{a.title}`);
code = code.replace(/<p className="text-\[10px\] text-muted-foreground">Puja actual<\/p>/g, `<p className="text-[10px] text-muted-foreground">Transmisión</p>`);

fs.writeFileSync(file, code, 'utf8');