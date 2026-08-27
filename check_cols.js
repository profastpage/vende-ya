const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profileCols = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='Profile'`;
  console.log("Profile cols:", JSON.stringify(profileCols, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());