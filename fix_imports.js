const fs = require('fs');
const path = require('path');

// 1. Fix page.tsx imports
const pageFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let pageText = fs.readFileSync(pageFile, 'utf8');
pageText = pageText.replace(/import \{ createServerClient \} from '@\/lib\/supabase\/server'/, "import { createServerClient } from '@/lib/vendeda/supabase-server'");
fs.writeFileSync(pageFile, pageText, 'utf8');

// 2. Fix actions.ts prisma import
const actionsFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let actionsText = fs.readFileSync(actionsFile, 'utf8');
actionsText = actionsText.replace(/const \{ db \} = await import\('@\/lib\/prisma'\);/, "const { db } = await import('@/lib/db');");
fs.writeFileSync(actionsFile, actionsText, 'utf8');

// 3. Fix LiveRoomClient.tsx imports
const roomFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let roomText = fs.readFileSync(roomFile, 'utf8');
if (!roomText.includes("import { useTransition } from 'react'")) {
  roomText = "import { useTransition } from 'react'\n" + roomText;
}
if (!roomText.includes("import { endLiveStream } from '@/app/vender/actions'")) {
  roomText = "import { endLiveStream } from '@/app/vender/actions'\n" + roomText;
}
fs.writeFileSync(roomFile, roomText, 'utf8');