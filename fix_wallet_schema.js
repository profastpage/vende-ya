const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/model Wallet \{[\s\S]*?\}/, `model Wallet {
  id               String   @id @default(cuid())
  userId           String   @unique
  availableBalance Decimal  @default(0.00) @db.Decimal(10, 2)
  frozenBalance    Decimal  @default(0.00) @db.Decimal(10, 2)
  updatedAt        DateTime @updatedAt
  payouts          PayoutRequest[]
}`);

fs.writeFileSync(file, text, 'utf8');