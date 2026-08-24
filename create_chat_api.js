const fs = require('fs');
const path = require('path');
const dir = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\chat');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const content = `import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { streamId, username, text, color, isBot } = await req.json()
    const msg = await db.liveChatMessage.create({
      data: {
        streamId,
        guestName: username,
        content: text,
        type: isBot ? 'ai' : 'user',
      }
    })
    return NextResponse.json(msg)
  } catch (error) {
    console.error('Chat insert error', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
`;
fs.writeFileSync(path.join(dir, 'route.ts'), content, 'utf8');
console.log('Created chat API route');