const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/const wallet = await db\.sellerWallet\.findUnique\(\{[\s\S]*?\}\)/, `const sellerWallet = await db.sellerWallet.findUnique({
      where: { id: sellerId },
      include: {
        ordersSeller: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { shipment: true },
        },
        copyrightReports: true,
      },
    })
    
    // Fetch or create Escrow Wallet
    let escrowWallet = await db.wallet.findUnique({
      where: { userId: sellerId },
      include: { payouts: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });
    
    if (!escrowWallet) {
      escrowWallet = await db.wallet.create({
        data: {
          userId: sellerId,
          availableBalance: 0,
          frozenBalance: 0,
        },
        include: { payouts: true }
      });
    }`);

text = text.replace(/if \(\!wallet\) \{/, `if (!sellerWallet) {`);

text = text.replace(/wallet: \{\n\s*id: wallet\.id,\n\s*gatewaySellerId: wallet\.gatewaySellerId,\n\s*isVerified: wallet\.isVerified,\n\s*status: wallet\.status,\n\s*\}/, `wallet: {
      id: sellerWallet.id,
      gatewaySellerId: sellerWallet.gatewaySellerId,
      isVerified: sellerWallet.isVerified,
      status: sellerWallet.status,
    },
    escrow: {
      id: escrowWallet.id,
      availableBalance: Number(escrowWallet.availableBalance),
      frozenBalance: Number(escrowWallet.frozenBalance),
      payouts: escrowWallet.payouts,
    }`);

text = text.replace(/wallet\./g, `sellerWallet.`);

fs.writeFileSync(file, text, 'utf8');