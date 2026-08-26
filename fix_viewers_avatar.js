const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// ViewersPill Avatar fix
const viewersRegex = /<div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-\[10px\] font-bold text-white">\s*\{user\.avatar \|\| 'E'\}\s*<\/div>/g;
const viewersReplacement = `{user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full object-cover border border-white/20" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white">
            {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
        )}`;
text = text.replace(viewersRegex, viewersReplacement);

// We need to make sure user.avatarUrl is passed down
const trackRegex = /avatar: user\?\.avatarUrl \|\| \(user\?\.displayName \|\| user\?\.email \|\| 'E'\)\.charAt\(0\)\.toUpperCase\(\)/g;
const trackReplacement = `avatar: (user?.displayName || user?.email || 'E').charAt(0).toUpperCase(),\n            avatarUrl: user?.avatarUrl`;
text = text.replace(trackRegex, trackReplacement);


fs.writeFileSync(file, text, 'utf8');