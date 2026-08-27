const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix hardcoded heart emoji
text = text.replace(
  /<motion\.span[\s\S]*?className="absolute text-2xl select-none"[\s\S]*?>\s*❤️\s*<\/motion\.span>/g,
  `<motion.span
                        key={emoji.id}
                        initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -150, x: emoji.left, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute text-2xl select-none"
                      >
                        {emoji.char}
                      </motion.span>`
);

// 2. Fix senderId not being passed to /api/chat
text = text.replace(
  /body: JSON\.stringify\(\{\n\s*streamId: id,\n\s*username: userName,\n\s*avatarUrl: user\?\.avatarUrl,\n\s*text: msg\.text,/g,
  `body: JSON.stringify({
            streamId: id,
            username: userName,
            avatarUrl: user?.avatarUrl,
            senderId: user?.id,
            text: msg.text,`
);

// 3. Hide the "Vende Ya asegura tu compra..." banner on mobile to save space
text = text.replace(
  /<div className="px-4 py-1\.5 mb-2 mx-3 bg-black\/40 backdrop-blur-md rounded-md border border-white\/5 flex items-center justify-center">/,
  `<div className="px-4 py-1.5 mb-2 mx-3 bg-black/40 backdrop-blur-md rounded-md border border-white/5 hidden md:flex items-center justify-center">`
);

// 4. Reduce Product Box padding on mobile
text = text.replace(
  /<div className="bg-\[#1c1c1e\]\/95 backdrop-blur-xl mx-3 mb-3 p-3\.5 rounded-\[20px\] border border-white\/10 shadow-2xl relative z-10">/,
  `<div className="bg-[#1c1c1e]/95 backdrop-blur-xl mx-2 md:mx-3 mb-2 md:mb-3 p-2 md:p-3.5 rounded-[16px] md:rounded-[20px] border border-white/10 shadow-2xl relative z-10">`
);

// 5. Shrink the chat input container on mobile slightly to give more room for the video play button
text = text.replace(
  /<div className="relative flex items-center bg-black\/50 backdrop-blur-md rounded-full px-4 py-2\.5 mx-3 mb-2 border border-white\/10 shadow-inner">/,
  `<div className="relative flex items-center bg-black/50 backdrop-blur-md rounded-full px-3 py-2 mx-2 md:mx-3 mb-1.5 md:mb-2 border border-white/10 shadow-inner">`
);

// 6. Reduce chat message container height slightly on mobile from h-[40vh] to h-[35vh] so the center is freer
text = text.replace(
  /<div className="h-\[40vh\] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col no-scrollbar relative z-10 pointer-events-auto"/,
  `<div className="h-[35vh] md:flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 flex flex-col no-scrollbar relative z-10 pointer-events-auto"`
);

fs.writeFileSync(file, text, 'utf8');