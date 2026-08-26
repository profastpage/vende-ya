const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Update ViewersPill to have click outside
const viewerPillOld = /function ViewersPill\(\{ viewers \}: \{ viewers: number \}\) \{\s*const \[open, setOpen\] = React\.useState\(false\)/;
const viewerPillNew = `function ViewersPill({ viewers }: { viewers: number }) {
  const [open, setOpen] = React.useState(false)
  const spectatorRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (spectatorRef.current && !spectatorRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])`;
text = text.replace(viewerPillOld, viewerPillNew);

// update div in ViewersPill
text = text.replace(/<div className="relative">/, `<div className="relative" ref={spectatorRef}>`);

// 2. Chat Auto-scroll
const mainCompRegex = /(const userName = .*?;\n)/;
const chatScrollHooks = `  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);\n`;
text = text.replace(mainCompRegex, `$1${chatScrollHooks}`);

// Append the messagesEndRef div to the chat container
const chatMessagesLoopRegex = /(\{\[\.\.\.chat\]\.reverse\(\)\.map\(\(msg\) => \([\s\S]*?<\/div>)\n\s*(<\/div>)/;
const chatMessagesLoopNew = `$1
                <div ref={messagesEndRef} />
              $2`;
text = text.replace(chatMessagesLoopRegex, chatMessagesLoopNew);


fs.writeFileSync(file, text, 'utf8');