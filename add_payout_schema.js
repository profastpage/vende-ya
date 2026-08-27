const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

const payoutModel = `
model PayoutRequest {
  id        String   @id @default(cuid())
  walletId  String
  amount    Float
  status    String   @default("pending") // pending | processing | completed | rejected
  method    String   @default("yape") // yape | plin | bank
  details   String?  // destination account info
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  wallet    Wallet   @relation(fields: [walletId], references: [id])
}
`;

if (!text.includes('PayoutRequest')) {
  // Insert before the last closing brace or at the end
  text = text + payoutModel;
  
  // Add relation to Wallet
  text = text.replace(/seller Profile @relation\(fields: \[sellerId\], references: \[id\], onDelete: Cascade\)\n\}/, 
    `seller Profile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  payouts PayoutRequest[]
}`);
  
  fs.writeFileSync(file, text, 'utf8');
}