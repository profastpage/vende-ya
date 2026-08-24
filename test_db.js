const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const sellerId = '890d7845-3c77-44a1-af6a-dc78ff311018';
    
    console.log('Testing wallet...');
    const wallet = await prisma.sellerWallet.findUnique({
      where: { id: sellerId },
      include: {
        ordersSeller: { take: 1 },
        copyrightReports: { take: 1 },
        ordersBuyer: { take: 1 }
      }
    });
    
    console.log('Testing reviews...');
    const reviews = await prisma.review.findMany({
      where: { revieweeId: sellerId },
      include: { reviewer: true },
      take: 1
    });

    console.log('Testing notifications...');
    const notifications = await prisma.notification.findMany({
      where: { userId: sellerId },
      take: 1
    });
    
    console.log('All queries succeeded.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();