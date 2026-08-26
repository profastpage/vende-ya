'use server'
import { db } from '@/lib/db'

export async function markOrderAsDelivered(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== 'SHIPPED') {
    throw new Error('Orden no válida para liberación.');
  }

  // Transacción atómica en la base de datos
  await db.$transaction(async (tx) => {
    // 1. Actualizar estado de la orden
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    });

    // 2. Mover de Saldo Congelado a Saldo Disponible en la Billetera del Vendedor
    await tx.wallet.update({
      where: { userId: order.sellerId },
      data: {
        frozenBalance: { decrement: order.totalAmount },
        availableBalance: { increment: order.sellerNetAmount }
      }
    });
  });

  return { success: true, message: 'Fondos liberados exitosamente al vendedor.' };
}