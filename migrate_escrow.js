const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    // 1. Create Enum
    await prisma.$executeRawUnsafe(`CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'HELD_IN_ESCROW', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'REFUNDED');`).catch(()=>console.log('Enum may already exist'));
    
    // 2. Create Wallet Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Wallet" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "availableBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        "frozenBalance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
      );
    `).catch(e=>console.log('Wallet table creation error:', e));

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_userId_key" ON "Wallet"("userId");
    `).catch(()=>console.log('Index Wallet_userId_key error'));

    // 3. Add columns to Order table
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "productId" TEXT;`).catch(e=>console.log(e));
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shalomTrackingCode" TEXT;`).catch(e=>console.log(e));
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';`).catch(e=>console.log(e));

    console.log("Migration finished.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
migrate();