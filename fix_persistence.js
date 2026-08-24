const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Add localStorage hook for Chat
text = text.replace(
    /const \[chat, setChat\] = React\.useState<ChatMessage\[\]>\(\[\]\)/,
    `const [chat, setChat] = React.useState<ChatMessage[]>(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(\`chat_\${id}\`)
        if (saved) {
          try { return JSON.parse(saved) } catch (e) {}
        }
      }
      return []
    })

    React.useEffect(() => {
      if (typeof window !== 'undefined' && chat.length > 0) {
        localStorage.setItem(\`chat_\${id}\`, JSON.stringify(chat))
      }
    }, [chat, id])`
);

// Add localStorage hook for Likes
text = text.replace(
    /const \[likes, setLikes\] = React\.useState\(stream\?\.likeCount \?\? 1240\)/,
    `const [likes, setLikes] = React.useState(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(\`likes_\${id}\`)
        if (saved) return parseInt(saved, 10)
      }
      return stream?.likeCount ?? 1240
    })

    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(\`likes_\${id}\`, likes.toString())
      }
    }, [likes, id])`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added local persistence');