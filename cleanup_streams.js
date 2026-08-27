const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.profile.findFirst({ where: { username: 'user_16504dd7' } });
  if (!user) return;
  const streams = await prisma.liveStream.findMany({ where: { sellerId: user.id, isLive: true }, orderBy: { createdAt: 'desc' } });
  
  if (streams.length > 1) {
    const toEnd = streams.slice(1).map(s => s.id);
    await prisma.liveStream.updateMany({
      where: { id: { in: toEnd } },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });
    console.log(`Ended ${toEnd.length} old streams.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());