const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/export async function createMultiStream\(title: string, streamUrl: string, isAuction: boolean, price: number\) \{/,
`export async function createMultiStream(title: string, streamUrl: string, isAuction: boolean, price: number, coverImage: string = '') {`);

code = code.replace(/streamProviderId: parsedStream\.id,/,
`streamProviderId: parsedStream.id,
          thumbnailUrl: coverImage || null,`);

fs.writeFileSync(file, code, 'utf8');