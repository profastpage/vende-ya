const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\productos\\[id]\\ProductDetailsClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/MOCK_REVIEWS\.length/g, `mappedReviews.length`);
code = code.replace(/MOCK_REVIEWS\.map/g, `mappedReviews.map`);

code = code.replace(/buyerId=\{MOCK_PROFILES\[5\]\?\.id \?\? 'demo-buyer'\}/g, `buyerId={'demo-buyer'}`);
code = code.replace(/receiverName=\{MOCK_PROFILES\[5\]\?\.displayName \?\? 'Comprador'\}/g, `receiverName={'Comprador'}`);

fs.writeFileSync(file, code, 'utf8');