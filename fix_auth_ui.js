const fs = require('fs');
const path = require('path');

// 1. Fix Apple Button Hover
const authButtonsPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialAuthButtons.tsx');
let authText = fs.readFileSync(authButtonsPath, 'utf8');
authText = authText.replace(
  /hoverClass: 'hover:bg-card hover:border-white\/25',/g,
  "hoverClass: 'hover:bg-zinc-800 hover:text-white',"
);
// Make sure AppleIcon is correctly rendered (currentColor)
authText = authText.replace(/fill="#000000"/g, 'fill="currentColor"');
fs.writeFileSync(authButtonsPath, authText, 'utf8');

// 2. Fix DesktopTopNav Auth State
const topNavPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DesktopTopNav.tsx');
let navText = fs.readFileSync(topNavPath, 'utf8');

// The replacement logic:
const avatarRegex = /<div className="relative" ref=\{dropdownRef\}>([\s\S]*?)<\/div>\s*<\/div>/;
const match = navText.match(avatarRegex);

if (match) {
  const replacement = `{user ? (
          <div className="relative" ref={dropdownRef}>
${match[1]}
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="font-bold border-zinc-200">Iniciar sesión</Button>
          </Link>
        )}
      </div>`;
  navText = navText.replace(avatarRegex, replacement);
  fs.writeFileSync(topNavPath, navText, 'utf8');
  console.log('Fixed DesktopTopNav');
} else {
  console.log('Could not find avatar section in DesktopTopNav');
}
