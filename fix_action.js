const fs = require('fs');
const path = require('path');
const actionsPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(actionsPath, 'utf8');

const newLogic = `
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Tu sesión ha expirado o no estás logueado. Por favor, vuelve a iniciar sesión.' }
  }

  try {
    // 1. Create dummy product for the stream
    const product = await db.product.create({
      data: {
        id: \`prod-\${Date.now()}\`,
        sellerId: user.id,
        title: title,
        description: 'Producto vendido en transmisión en vivo por Kick',
        basePrice: price,
        currency: 'PEN',
        stock: 1,
        images: "[]",
        status: 'active'
      }
    })

    // 2. Create the Live Stream record
    const stream = await db.liveStream.create({
      data: {
        id: \`stream-\${Date.now()}\`,
        sellerId: user.id,
        title: title,
        streamKey: \`kick-\${Date.now()}\`,
        isLive: true,
        status: 'live',
        kickUsername: kickUsername.toLowerCase().trim()
      }
    })

    // 3. Create the auction if applicable
    if (isAuction) {
      await db.auction.create({
        data: {
          id: \`auc-\${Date.now()}\`,
          productId: product.id,
          sellerId: user.id,
          streamId: stream.id,
          startingPrice: price,
          currentPrice: price,
          status: 'live',
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes default for testing
        }
      })
    }

    revalidatePath('/')
    return { success: true, streamId: stream.id }
  } catch (error: any) {
    console.error('Error in createKickStream:', error);
    // Return graceful error instead of throwing 500
    return { success: false, error: 'Hubo un error en la base de datos al crear tu transmisión. Asegúrate de haber completado tu perfil.' }
  }
}
`;

text = text.replace(/const supabase = await createServerClient\(\)[\s\S]*?\}\n/m, newLogic.trim() + '\n');
fs.writeFileSync(actionsPath, text, 'utf8');
console.log('Fixed actions.ts');