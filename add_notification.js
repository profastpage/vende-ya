const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\checkout\\route.ts');
let code = fs.readFileSync(file, 'utf8');

const target = `      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: order.paymentStatus,`;

const replacement = `      // Notificar al vendedor sobre la nueva venta
      await db.notification.create({
        data: {
          userId: sellerId,
          type: 'auction-sold',
          title: 'Nueva Venta!',
          message: \`Has vendido un producto por S/ \${totalAmount.toFixed(2)}. Revisa tus envos pendientes.\`,
          link: '/dashboard',
        }
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: order.paymentStatus,`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code, 'utf8');