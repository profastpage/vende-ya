const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

const startStr = "function ChatMessageBubble({ msg }: { msg: ChatMessage }) {";
const endStr = "export default function LiveRoomClient";

const startIndex = text.indexOf(startStr);
const endIndex = text.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.isBot) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="text-xs px-2.5 py-1.5 rounded-xl backdrop-blur-sm border bg-purple-500/15 border-purple-400/30 shadow-lg shadow-purple-500/10 text-white"
      >
        <span className="font-bold text-purple-400 mr-1.5">{msg.username}</span>
        <span className="text-zinc-100/90 leading-relaxed">{msg.text}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="text-[13px] px-1 py-1 text-white"
      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9), 0px 1px 1px rgba(0,0,0,0.6)' }}
    >
      <div className="flex items-start gap-2">
        {msg.avatarUrl ? (
          <img src={msg.avatarUrl} alt={msg.username} className="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/20 shadow-sm" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5 border border-white/20 shadow-sm">
            {msg.username?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div className="flex flex-col leading-tight gap-0.5">
          <span className="font-extrabold text-white/95 text-[12px]">{msg.username}</span>
          <span className="text-white text-[13px] break-words leading-snug">{msg.text}</span>
        </div>
      </div>
    </motion.div>
  )
}

`;
  text = text.substring(0, startIndex) + replacement + text.substring(endIndex);
  fs.writeFileSync(file, text, 'utf8');
  console.log("Replaced ChatMessageBubble successfully");
} else {
  console.log("Could not find start or end index for ChatMessageBubble");
}