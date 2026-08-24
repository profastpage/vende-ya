const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Safeguard currentBid and bidCount initialization
text = text.replace(
    /const \[currentBid, setCurrentBid\] = React\.useState\(auction\.currentPrice\)/,
    `const safeAuction = auction || { id: '', currentPrice: 0, bidCount: 0, buyNowPrice: 0, startingPrice: 0, bidIncrement: 2 };
  const safeProduct = product || { title: 'Esperando producto...', description: 'El vendedor no ha iniciado una subasta.', stock: 0 };
  const [currentBid, setCurrentBid] = React.useState(safeAuction.currentPrice)`
);

text = text.replace(/auction\.id/g, 'safeAuction.id');
text = text.replace(/auction\.buyNowPrice/g, 'safeAuction.buyNowPrice');
text = text.replace(/auction\.startingPrice/g, 'safeAuction.startingPrice');
text = text.replace(/auction\.bidIncrement/g, 'safeAuction.bidIncrement');
text = text.replace(/auction\.bidCount/g, 'safeAuction.bidCount');

text = text.replace(/product\?\.title/g, 'safeProduct.title');
text = text.replace(/product\?\.description/g, 'safeProduct.description');
text = text.replace(/product\?\.images\?\.\[0\]/g, 'safeProduct.images?.[0]');
text = text.replace(/product\?\.stock/g, 'safeProduct.stock');
text = text.replace(/product\?\.id/g, 'safeProduct.id');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed LiveRoomClient null safety');