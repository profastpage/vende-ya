const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

// Add OrderStatus enum
text += `\nenum OrderStatus {
  PENDING
  HELD_IN_ESCROW
  SHIPPED
  DELIVERED
  COMPLETED
  REFUNDED
}\n`;

// Add Wallet model
text += `\nmodel Wallet {
  id               String   @id @default(cuid())
  userId           String   @unique
  availableBalance Decimal  @default(0.00) @db.Decimal(10, 2)
  frozenBalance    Decimal  @default(0.00) @db.Decimal(10, 2)
  updatedAt        DateTime @updatedAt
}\n`;

// Add fields to Order
text = text.replace(/model Order {[\s\S]*?createdAt/m, (match) => {
    return match.replace(/createdAt/, `productId String?\n    shalomTrackingCode String?\n    status OrderStatus @default(PENDING)\n    createdAt`);
});

fs.writeFileSync(file, text, 'utf8');