const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vendedores\\[username]\\SellerProfileClient.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Fix mappedReviews
code = code.replace(/productTitle: r\.order\?\.items\?\.\[0\]\?\.product\?\.title \|\| 'Producto'/, `productTitle: 'Producto'`);

// 2. Fix activeAuctions mapping
code = code.replace(/product: \{ images: \[activeStream\.thumbnailUrl \|\| 'https:\/\/placehold\.co\/400x400\/1a1a1a\/333333\.png\?text=LIVE'\] \}/,
`product: { images: [activeStream.thumbnailUrl || 'https://placehold.co/400x400/1a1a1a/333333.png?text=LIVE'], title: activeStream.title }, bidCount: 0, watcherCount: activeStream.viewers || 0`);

// 3. Fix sellerAuctions mapping
code = code.replace(/product: \{ images: \[s\.thumbnailUrl \|\| 'https:\/\/placehold\.co\/400x400\/1a1a1a\/333333\.png\?text=VOD'\] \}/,
`product: { images: [s.thumbnailUrl || 'https://placehold.co/400x400/1a1a1a/333333.png?text=VOD'], title: s.title }, bidCount: 0, watcherCount: s.viewers || 0`);

fs.writeFileSync(file, code, 'utf8');