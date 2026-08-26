const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Iframe youtube autoplay
const iframeRegex = /src=\{`https:\/\/www\.youtube\.com\/embed\/\$\{videoId\}\?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1`\}/;
const newIframe = "src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`}";
if (text.match(iframeRegex)) {
    text = text.replace(iframeRegex, newIframe);
} else {
    const backupRegex = /src=\{`https:\/\/www\.youtube\.com\/embed\/\$\{videoId\}\?.*?`\}/;
    text = text.replace(backupRegex, newIframe);
}

// Presence grouping logic
const presenceOld = /const usersList = Object\.values\(state\)\.flat\(\);\n\s*setSpectators\(usersList\);/;
const presenceNew = `const usersList = Object.values(state).flat();
        
        // Filtrar usuarios reales (que tengan un ID válido de Supabase o nombre distinto a 'Anónimo')
        const reals = usersList.filter((u: any) => u.name !== 'Espectador Anónimo');
        // Contar el resto
        const anons = usersList.length - reals.length;
        
        setRealSpectators(reals);
        setAnonymousCount(anons);`;

if (text.match(presenceOld)) {
    text = text.replace(presenceOld, presenceNew);
} else {
    console.log("Presence regex not matched.");
}

// Update ViewersPill props and implementation
text = text.replace(/const \[spectators, setSpectators\] = React\.useState<any\[\]>\(\[\]\)/, `const [realSpectators, setRealSpectators] = React.useState<any[]>([])
    const [anonymousCount, setAnonymousCount] = React.useState(0)`);

text = text.replace(/<ViewersPill spectators=\{spectators\} \/>/g, `<ViewersPill realSpectators={realSpectators} anonymousCount={anonymousCount} />`);

const pillOld = /function ViewersPill\(\{ spectators \}: \{ spectators: any\[\] \}\) \{\n\s*const viewers = spectators\.length;/;
const pillNew = `function ViewersPill({ realSpectators, anonymousCount }: { realSpectators: any[], anonymousCount: number }) {
  const viewers = realSpectators.length + anonymousCount;`;
text = text.replace(pillOld, pillNew);

const pillRenderOld = /\{spectators\.slice\(0, 10\)\.map\(\(spec, idx\) => \([\s\S]*?y \{spectators\.length - 10\} mǭs\.\.\.\n\s*<\/div>\n\s*\)\}/;
// Note: It says "más..." or "mǭs...". I will just replace from `{spectators.slice(0, 10).map(` up to `)}`
const listRegex = /\{spectators\.slice\(0, 10\)[\s\S]*?\)\}/;
const pillRenderNew = `{realSpectators.map((user, idx) => (
    <div key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
        {user.avatar || 'E'}
      </div>
      <span className="text-xs font-medium text-white truncate">{user.name}</span>
    </div>
  ))}

  {anonymousCount > 0 && (
    <div className="flex items-center gap-2 px-2 py-1.5 mt-1 border-t border-white/10">
      <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
        +
      </div>
      <span className="text-xs font-medium text-zinc-400 italic">
        {anonymousCount} anónimo{anonymousCount !== 1 ? 's' : ''}
      </span>
    </div>
  )}`;

text = text.replace(listRegex, pillRenderNew);


fs.writeFileSync(file, text, 'utf8');