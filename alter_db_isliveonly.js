const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN "isLiveOnly" BOOLEAN NOT NULL DEFAULT false;');
    console.log('Successfully added isLiveOnly column to Product table');
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