const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Add isMobile state to LiveRoomClient
text = text.replace(/export default function LiveRoomClient\(\{ stream, id \}: \{ stream: any, id: string \}\) \{/,
`export default function LiveRoomClient({ stream, id }: { stream: any, id: string }) {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check immediately on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);`);

// Replace the return block
text = text.replace(/return \(\s*<>\s*\{DesktopLayout\}\s*\{MobileLayout\}\s*<\/>\s*\)/,
`return (
    <>
      {isMobile ? MobileLayout : DesktopLayout}
    </>
  )`);

// Clean up any remaining display:none on the roots
text = text.replace(/<div className="hidden md:flex gap-6 max-w-7xl mx-auto p-4 bg-black text-zinc-100 min-h-\[calc\(100vh-4rem\)\]">/,
`<div className="flex gap-6 max-w-7xl mx-auto p-4 bg-black text-zinc-100 min-h-[calc(100vh-4rem)]">`);

text = text.replace(/<div className="md:hidden fixed inset-0 z-50 bg-black text-white select-none overflow-hidden">/,
`<div className="fixed inset-0 z-50 bg-black text-white select-none overflow-hidden">`);

fs.writeFileSync(file, text, 'utf8');