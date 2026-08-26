const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Update ViewersPill signature
const pillOld = /function ViewersPill\(\{ viewers \}: \{ viewers: number \}\) \{/;
const pillNew = `function ViewersPill({ spectators }: { spectators: any[] }) {
  const viewers = spectators.length;`;
text = text.replace(pillOld, pillNew);

// 2. Replace the simulated list in ViewersPill with the real spectators mapping
const simulatedListRegex = /\{\/\* Simulated MVP Viewers \*\/\}[\s\S]*?y \{Math\.max\(0, viewers - 3\)\} mǭs\.\.\.\n\s*<\/div>/;
const dynamicList = `{spectators.slice(0, 10).map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {spec.avatar || 'E'}
                  </div>
                  <span className="text-xs font-medium text-white truncate">{spec.name || 'Espectador Anónimo'}</span>
                </div>
              ))}
              {spectators.length > 10 && (
                <div className="px-2 py-1.5 text-xs text-zinc-500 italic">
                  y {spectators.length - 10} más...
                </div>
              )}`;
text = text.replace(simulatedListRegex, dynamicList);

// 3. Add spectators state to LiveRoomClient
text = text.replace(/const \[viewers, setViewers\] = React\.useState\(1\)/, `const [viewers, setViewers] = React.useState(1)\n    const [spectators, setSpectators] = React.useState<any[]>([])`);

// 4. Update the chatChannel config to use the real user
const chatConfigOld = /config: \{\n\s*presence: \{\n\s*key: 'user_' \+ Math\.random\(\)\.toString\(36\)\.substring\(7\),\n\s*\},\n\s*\}/;
const chatConfigNew = `config: {
          presence: {
            key: user?.id || 'anon_' + Math.random().toString(36).substring(7),
          },
        }`;
text = text.replace(chatConfigOld, chatConfigNew);

// 5. Update the presence sync logic
const presenceSyncOld = /chatChannel\.on\('presence', \{ event: 'sync' \}, \(\) => \{\n\s*const state = chatChannel\.presenceState\(\)\n\s*let count = 0\n\s*for \(const key in state\) \{\n\s*count \+= state\[key\]\.length\n\s*\}\n\s*setViewers\(count\)\n\s*\}\)/;
const presenceSyncNew = `chatChannel.on('presence', { event: 'sync' }, () => {
        const state = chatChannel.presenceState();
        const usersList = Object.values(state).flat();
        setSpectators(usersList);
      })`;
text = text.replace(presenceSyncOld, presenceSyncNew);

// 6. Update the track logic
const trackOld = /chatChannel\.subscribe\(async \(\status\) => \{\n\s*if \(\status === 'SUBSCRIBED'\) \{\n\s*await chatChannel\.track\(\{ online: true \}\)\n\s*\}\n\s*\}\)/;
const trackNew = `chatChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await chatChannel.track({
            id: user?.id || 'anon',
            name: (user as any)?.user_metadata?.name || user?.email || 'Espectador Anónimo',
            avatar: user?.email ? user.email.charAt(0).toUpperCase() : 'E'
          });
        }
      })`;
text = text.replace(trackOld, trackNew);

// Add user to dependency array
text = text.replace(/\}, \[auction\?\.id, id, supabase\]\)/, `}, [auction?.id, id, supabase, user])`);

// 7. Update usage of ViewersPill
text = text.replace(/<ViewersPill viewers=\{viewers\} \/>/g, `<ViewersPill spectators={spectators} />`);

fs.writeFileSync(file, text, 'utf8');