const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/seller Profile @relation\(fields: \[sellerId\], references: \[id\], onDelete: Cascade\)\n\s*payouts PayoutRequest\[\]\n\}/, `seller Profile @relation(fields: [sellerId], references: [id], onDelete: Cascade)\n}`);

text = text.replace(/seller Profile @relation\(fields: \[sellerId\], references: \[id\], onDelete: Cascade\)\n\}/, `seller Profile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  payouts PayoutRequest[]
}`);

fs.writeFileSync(file, text, 'utf8');