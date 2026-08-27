const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PayoutRequest" (
      "id" TEXT NOT NULL,
      "walletId" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "method" TEXT NOT NULL DEFAULT 'yape',
      "details" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayoutRequest_walletId_fkey') THEN
        ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `);
  
  console.log("Payout migration applied");
}

main().catch(console.error).finally(() => prisma.$disconnect());