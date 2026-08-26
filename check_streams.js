const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const streams = await prisma.liveStream.findMany({ include: { seller: true } });
  console.log(JSON.stringify(streams.map(s => ({ id: s.id, sellerUsername: s.seller?.username })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());