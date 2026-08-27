const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /\/\/ 1\. Create the Live Stream/g,
  `// 0.5. End any previous active streams
    await db.liveStream.updateMany({
      where: { sellerId: user.id, isLive: true },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });

    // 1. Create the Live Stream`
);

fs.writeFileSync(file, text, 'utf8');