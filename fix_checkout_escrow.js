const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\checkout\\route.ts');
let text = fs.readFileSync(file, 'utf8');

const regex = /const order = await db\.order\.create\(\{[\s\S]*?\}\);/;
const replacement = `const order = await db.order.create({
      data: {
        buyerId,
        sellerId,
        source,
        totalAmount,
        platformCommissionRate: split.platformCommissionRate,
        platformCommissionAmount: split.platformCommissionAmount,
        gatewayFeeAmount: split.gatewayFeeWithIgv,
        sellerNetAmount: split.sellerNetAmount,
        paymentStatus: 'paid',
        paymentMethod,
        gatewayTransactionId,
      },
    });

    // ESCROW: Incrementar el Saldo Congelado (frozenBalance) del vendedor
    await db.wallet.upsert({
      where: { userId: sellerId },
      create: {
        userId: sellerId,
        frozenBalance: totalAmount, // Retenemos el total hasta que se entregue
        availableBalance: 0,
      },
      update: {
        frozenBalance: { increment: totalAmount },
      }
    });`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');