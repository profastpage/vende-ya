const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "LiveStream" ADD COLUMN "streamProvider" TEXT DEFAULT \'YOUTUBE\';');
    await prisma.$executeRawUnsafe('ALTER TABLE "LiveStream" ADD COLUMN "streamProviderId" TEXT;');
    
    // Copy youtubeLiveId to streamProviderId for existing streams
    await prisma.$executeRawUnsafe('UPDATE "LiveStream" SET "streamProviderId" = "youtubeLiveId" WHERE "youtubeLiveId" IS NOT NULL;');
    
    console.log('Successfully added streamProvider and streamProviderId columns to LiveStream table');
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