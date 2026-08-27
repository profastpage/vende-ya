const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.profile.findFirst({ where: { username: 'user_16504dd7' } });
  if (!user) { console.log('User not found'); return; }
  const streams = await prisma.liveStream.findMany({ where: { sellerId: user.id, isLive: true, status: 'live' } });
  console.log(`Found ${streams.length} live streams:`);
  streams.forEach(s => console.log(s.id, s.youtubeLiveId, s.streamProviderId, s.createdAt));
}

main().catch(console.error).finally(() => prisma.$disconnect());