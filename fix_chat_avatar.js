const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const chatBubbleRegex = /<span className=\{\`font-bold \$\{msg\.color\}\`\}>\{msg\.username\}<\/span>/;
const chatBubbleReplacement = `{msg.avatarUrl ? (
            <img src={msg.avatarUrl} alt={msg.username} className="h-4 w-4 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-[8px] font-bold text-white">
              {msg.username?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <span className={\`font-bold \${msg.color}\`}>{msg.username}</span>`;

text = text.replace(chatBubbleRegex, chatBubbleReplacement);

// We also need to add avatarUrl to ChatMessage type and the sender payload
text = text.replace(/export type ChatMessage = \{[\s\S]*?\}/, `export type ChatMessage = {
  id: string
  username: string
  text: string
  color: string
  isBot?: boolean
  avatarUrl?: string | null
}`);

// Inject avatarUrl when sending
text = text.replace(/const msg = \{ id: Date\.now\(\)\.toString\(\), username: 'Tǧ', text: chatInput\.trim\(\), color: 'text-lime-400' \}/, 
`const msg = { id: Date.now().toString(), username: user?.displayName || 'Tú', text: chatInput.trim(), color: 'text-lime-400', avatarUrl: user?.avatarUrl }`);

// Fix payload being sent
text = text.replace(/username: userName,/g, `username: userName,\n            avatarUrl: user?.avatarUrl,`);
text = text.replace(/await chatChannel\.send\(\{\s*type: 'broadcast',\s*event: 'new_message',\s*payload: msg,\s*\}\)/g, 
`await chatChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: msg,
      })`);

fs.writeFileSync(file, text, 'utf8');