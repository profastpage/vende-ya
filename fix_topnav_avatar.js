const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DesktopTopNav.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /<AvatarImage src="https:\/\/i\.pravatar\.cc\/150\?img=8" alt="Tu perfil" \/>/g;
const replacement = ``; // Remove the fake image
text = text.replace(regex, replacement);

const regex2 = /<AvatarFallback className="bg-accent text-gray-800">\{user\?\.displayName \? user\.displayName\.slice\(0, 2\)\.toUpperCase\(\) : 'Ts'\}<\/AvatarFallback>/;
const replacement2 = `<AvatarFallback className="bg-gradient-to-br from-amber-400 to-fuchsia-600 font-black text-zinc-950 text-xs">
                  {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : 'U'}
                </AvatarFallback>`;
text = text.replace(regex2, replacement2);

fs.writeFileSync(file, text, 'utf8');