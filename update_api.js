const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('reviews: {')) {
    text = text.replace(
        /copyrightReports: \{\s*orderBy: \{ createdAt: 'desc' \},\s*take: 10,\s*\},\s*\}/,
        `copyrightReports: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      ordersBuyer: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { shipment: true, review: true, seller: true },
      },
    },
  });

  const reviews = await db.review.findMany({
    where: { revieweeId: sellerId },
    include: { reviewer: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
`
    );
    
    text = text.replace(
        /return NextResponse\.json\(\{\s*wallet,\s*recentOrders,\s*pendingDropoffs,\s*copyrightReports: wallet\?\.copyrightReports \?\? \[\],\s*summary,\s*\}\);/,
        `return NextResponse.json({
      wallet,
      recentOrders,
      pendingDropoffs,
      copyrightReports: wallet?.copyrightReports ?? [],
      summary,
      recentPurchases: wallet?.ordersBuyer ?? [],
      reviews,
    });`
    );
    
    fs.writeFileSync(file, text, 'utf8');
    console.log('Updated dashboard API route to fetch reviews and purchases');
} else {
    console.log('Already updated');
}