const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let text = fs.readFileSync(file, 'utf8');

// Wrap Review and Notification in try/catch and fix the JSON response!
text = text.replace(
    /const reviews = await db\.review\.findMany\(\{[\s\S]*?take: 5\r?\n\s*\}\);/,
    `let reviews = [];
  try {
    reviews = await db.review.findMany({
      where: { revieweeId: sellerId },
      include: { reviewer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  } catch (e) { console.error("Review fetch error", e); }`
);

text = text.replace(
    /const notifications = await db\.notification\.findMany\(\{[\s\S]*?take: 6\r?\n\s*\}\);/,
    `let notifications = [];
  try {
    notifications = await db.notification.findMany({
      where: { userId: sellerId },
      orderBy: { createdAt: 'desc' },
      take: 6
    });
  } catch (e) { console.error("Notification fetch error", e); }`
);

// Add them to the JSON response
text = text.replace(
    /alerts,\r?\n\s*\}\);/,
    `alerts,\n      reviews,\n      notifications,\n    });`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed API Route with try/catch and correct JSON return');