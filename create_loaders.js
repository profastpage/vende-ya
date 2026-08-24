const fs = require('fs');
const path = require('path');
const dir1 = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo');
const dir2 = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app');

const content = `export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-black tracking-widest uppercase text-sm animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(path.join(dir1, 'loading.tsx'), content, 'utf8');
fs.writeFileSync(path.join(dir2, 'loading.tsx'), content, 'utf8');
console.log('Created loading.tsx files for instant transitions');