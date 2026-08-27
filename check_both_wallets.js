const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sw1 = await prisma.$queryRaw`SELECT * FROM "SellerWallet" LIMIT 1`;
  const sw2 = await prisma.$queryRaw`SELECT * FROM "seller_wallets" LIMIT 1`;
  console.log("SellerWallet:", JSON.stringify(sw1, null, 2));
  console.log("seller_wallets:", JSON.stringify(sw2, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());