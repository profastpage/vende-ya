const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "LiveStream" ADD COLUMN "youtubeLiveId" TEXT;');
    console.log('Successfully added youtubeLiveId column to LiveStream table');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Column already exists, ignoring.');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();