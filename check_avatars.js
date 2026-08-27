const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, image: true } });
  const profiles = await prisma.profile.findMany({ select: { id: true, username: true, displayName: true, avatarUrl: true } });
  console.log("USERS:", JSON.stringify(users, null, 2));
  console.log("PROFILES:", JSON.stringify(profiles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());