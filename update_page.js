const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('createServerClient')) {
  text = `import { createServerClient } from '@/lib/supabase/server'\n` + text;
}

if (!text.includes('supabase.auth.getUser()')) {
  text = text.replace(/export default async function StreamDetailPage[^\{]*\{/,
`export default async function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
`);
  
  text = text.replace(/<LiveRoomClient[\s\S]*?stream=\{stream\}/,
`<LiveRoomClient 
      currentUserId={user?.id}
      stream={stream}`);
      
  fs.writeFileSync(file, text, 'utf8');
}