const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\lib\\vendeda\\supabase-server.ts');
let text = fs.readFileSync(file, 'utf8');

const oldFuncStart = `export async function getAuthenticatedUser(request: Request): Promise<{
  user: { id: string; email: string | null } | null
  error: string | null
}> {`;

const newFunc = `export async function getAuthenticatedUser(request: Request): Promise<{
  user: { id: string; email: string | null } | null
  error: string | null
}> {
  if (!isSupabaseServerConfigured) {
    return { user: null, error: 'Supabase no configurado en el servidor.' }
  }
  
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error: error?.message || 'Sesin invlida o expirada.' }
    }
    
    return {
      user: { id: user.id, email: user.email ?? null },
      error: null,
    }
  } catch (error: any) {
    return { user: null, error: error?.message || 'Server Error' }
  }
}

// EOF_MARKER`;

// We'll just replace everything from `export async function getAuthenticatedUser` to the end of the file.
const splitText = text.split(oldFuncStart);
text = splitText[0] + newFunc;
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed getAuthenticatedUser');