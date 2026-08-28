const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\studio\\actions.ts');
let code = fs.readFileSync(file, 'utf8');

code += `\n
export async function endStream(streamId: string) {
  try {
    await db.liveStream.update({
      where: { id: streamId },
      data: { isLive: false, status: 'ended', endedAt: new Date() }
    });
    return { success: true };
  } catch(e) {
    return { error: 'Failed to end stream' };
  }
}
`;

fs.writeFileSync(file, code, 'utf8');