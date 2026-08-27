'use server'
import { db } from '@/lib/db'

export async function requestPayout(sellerId: string, amount: number, method: string, details: string) {
  if (!sellerId) return { error: "No autorizado" }
  if (amount <= 0) return { error: "Monto inválido" }
  if (!method || !details) return { error: "Faltan datos de retiro" }

  const wallet = await db.wallet.findUnique({ where: { userId: sellerId } })
  if (!wallet) return { error: "Billetera no encontrada" }

  if (Number(wallet.availableBalance) < amount) {
    return { error: "Saldo insuficiente" }
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Create payout request
      await tx.payoutRequest.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          method: method,
          details: details,
          status: 'pending'
        }
      });
      
      // 2. Move funds from available to frozen (locked for processing)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          frozenBalance: { increment: amount }
        }
      });
    });
    
    return { success: true }
  } catch (error) {
    console.error("Payout error:", error);
    return { error: "Ocurrió un error al procesar la solicitud" }
  }
}