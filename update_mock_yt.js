const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Set a known active 24/7 YouTube live stream (NASA Live or similar)
    // Actually, Sky News is usually 9Auq9mYxFEE, but let's use a standard popular one:
    // Lofi girl is currently `jfKfPfyJRkM`. If it's down, maybe `21X5lGlDOfg` (NASA)
    // Let's just update all where youtubeLiveId is null
    await prisma.$executeRawUnsafe(`UPDATE "LiveStream" SET "youtubeLiveId" = '21X5lGlDOfg' WHERE "youtubeLiveId" IS NULL;`);
    console.log('Updated existing streams with a demo YouTube ID');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();