const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DesktopTopNav.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /\{user\?\.avatarUrl \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\)\s*\}/;
const replacement = `{user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}`;
text = text.replace(regex, replacement);

const fallbackRegex = /<AvatarFallback[\s\S]*?<\/AvatarFallback>/;
const fallbackReplacement = `<AvatarFallback className="bg-gradient-to-br from-amber-400 to-fuchsia-600 font-black text-white text-xs">
                  {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : 'U'}
                </AvatarFallback>`;
text = text.replace(fallbackRegex, fallbackReplacement);

fs.writeFileSync(file, text, 'utf8');