const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\admin\\page.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('killAllGhostStreams')) {
  code = code.replace(/import \{ banUser, unbanUser, killStream \} from '\.\/actions'/, `import { banUser, unbanUser, killStream, killAllGhostStreams } from './actions'`);
  
  const target = `<h2 className="text-xl font-bold border-b border-zinc-800 pb-2 text-white">📡 Streams Activos (Control Manual)</h2>`;
  const replacement = `<div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4">
              <h2 className="text-xl font-bold text-white">📡 Streams Activos (Control Manual)</h2>
              <form action={async () => {
                'use server';
                await killAllGhostStreams();
              }}>
                <button type="submit" className="bg-red-900/40 text-red-400 border border-red-900 hover:bg-red-800 hover:text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                  <Skull className="w-4 h-4" /> Apagar Todos los Fantasmas
                </button>
              </form>
            </div>`;
  
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code, 'utf8');
}