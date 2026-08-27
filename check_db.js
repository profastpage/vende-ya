const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.profile.findFirst({ where: { username: 'user_16504dd7' } });
  if (!user) { console.log('User not found'); return; }
  const stream = await prisma.liveStream.findFirst({ where: { sellerId: user.id }, orderBy: { createdAt: 'desc' } });
  console.log(stream);
}

main().catch(console.error).finally(() => prisma.$disconnect());