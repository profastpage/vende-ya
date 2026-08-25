const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('endLiveStream')) {
  text += `\n
export async function endLiveStream(streamId: string) {
  const { db } = await import('@/lib/prisma');
  const { revalidatePath } = await import('next/cache');
  
  await db.liveStream.update({
    where: { id: streamId },
    data: { 
      isLive: false,
      status: 'ended',
      endedAt: new Date()
    }
  });
  
  revalidatePath('/');
  revalidatePath('/marketplace');
  return { success: true };
}
`;
  fs.writeFileSync(file, text, 'utf8');
}