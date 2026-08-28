const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\admin\\actions.ts');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('killAllGhostStreams')) {
  code += `\n
export async function killAllGhostStreams() {
  try {
    await db.liveStream.updateMany({
      where: { isLive: true },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch(e) {
    return { error: 'Failed to kill all streams' };
  }
}
`;
  fs.writeFileSync(file, code, 'utf8');
}