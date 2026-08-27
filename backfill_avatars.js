const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`SELECT id, raw_user_meta_data FROM auth.users`;
  for (const u of users) {
    const meta = u.raw_user_meta_data || {};
    const avatar = meta.avatar_url || meta.picture || meta.photo;
    if (avatar) {
      await prisma.$executeRawUnsafe(`UPDATE "Profile" SET "avatarUrl" = $1 WHERE "id" = $2`, avatar, u.id);
    }
  }
  console.log("Backfilled avatars");
}

main().catch(console.error).finally(() => prisma.$disconnect());