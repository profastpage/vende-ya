const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.liveStream.create({
      data: {
        id: `stream-test-${Date.now()}`,
        sellerId: '0c7eb1be-5573-455a-bd57-3f36a88b1cc9', // need a valid sellerId. Let's just do a findFirst.
        title: 'Test',
        streamKey: 'yt-test',
        status: 'live',
        youtubeLiveId: '-1TI2PtV06Q',
        kickUsername: null
      }
    });
    console.log('Success:', res);
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();