const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/export default async function StreamDetailPage\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{\n  const supabase = await createServerClient\(\)\n  const \{ data: \{ user \} \} = await supabase.auth.getUser\(\)\n params \}: \{ params: Promise<\{ id: string \}> \}\) \{/,
`export default async function StreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
`);

fs.writeFileSync(file, text, 'utf8');