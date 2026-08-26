const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('model Wallet')) {
    const newModels = `
// ---------------------------------------------------------------------
// ESCROW WALLET SYSTEM
// ---------------------------------------------------------------------
model Wallet {
  id               String   @id @default(cuid())
  userId           String   @unique
  availableBalance Decimal  @default(0.00) @db.Decimal(10, 2)
  frozenBalance    Decimal  @default(0.00) @db.Decimal(10, 2)
  updatedAt        DateTime @updatedAt
}

model Order {
  id                 String      @id @default(cuid())
  buyerId            String
  sellerId           String
  productId          String
  totalAmount        Decimal     @db.Decimal(10, 2)
  platformFee        Decimal     @db.Decimal(10, 2) // 12%
  sellerEarnings     Decimal     @db.Decimal(10, 2) // 88%
  status             OrderStatus @default(PENDING)
  shalomTrackingCode String?
  createdAt          DateTime    @default(now())
}

enum OrderStatus {
  PENDING
  HELD_IN_ESCROW
  SHIPPED
  DELIVERED
  COMPLETED
  REFUNDED
}
`;
    text += newModels;
    fs.writeFileSync(file, text, 'utf8');
}