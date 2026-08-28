const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\chat\\route.ts');
let code = fs.readFileSync(file, 'utf8');

const replacement = `import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { moderateChat } from '@/lib/vendeda/ai'

export async function POST(req: Request) {
  try {
    const { streamId, username, text, color, isBot, senderId } = await req.json()
    
    // IA Moderation
    if (!isBot) {
      const modResult = await moderateChat({ text, senderId, streamId });
      if (modResult.flagged) {
        // Guardamos el mensaje pero lo marcamos y censuramos
        await db.liveChatMessage.create({
          data: {
            streamId,
            guestName: username,
            senderId: senderId || null,
            content: '[CENSURADO]',
            type: 'user',
          }
        });
        
        // Disparar reporte o notificacin al admin opcionalmente aqu
        return NextResponse.json({ flagged: true, reason: modResult.reason });
      }
    }

    const msg = await db.liveChatMessage.create({
      data: {
        streamId,
        guestName: username,
        senderId: senderId || null,
        content: text,
        type: isBot ? 'ai' : 'user',
      }
    })
    return NextResponse.json({ flagged: false, msg })
  } catch (error) {
    console.error('Chat insert error', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}`;

fs.writeFileSync(file, replacement, 'utf8');