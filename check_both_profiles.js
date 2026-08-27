const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.$queryRaw`SELECT * FROM "Profile" LIMIT 1`;
  const p2 = await prisma.$queryRaw`SELECT * FROM "profiles" LIMIT 1`;
  console.log("Profile:", JSON.stringify(p1, null, 2));
  console.log("profiles:", JSON.stringify(p2, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());