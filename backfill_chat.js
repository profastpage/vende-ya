const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany();
  const msgs = await prisma.liveChatMessage.findMany({ where: { senderId: null } });
  
  let updated = 0;
  for (const m of msgs) {
    if (m.guestName) {
      // Find profile by username, displayName, or some match
      const p = profiles.find(pr => pr.username === m.guestName || pr.displayName === m.guestName);
      if (p) {
        await prisma.liveChatMessage.update({ where: { id: m.id }, data: { senderId: p.id } });
        updated++;
      }
    }
  }
  console.log(`Backfilled ${updated} chat messages.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());