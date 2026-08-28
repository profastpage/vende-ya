const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `{/* Share */}
      <button className="flex flex-col items-center gap-1 group">`;

const replacement = `{/* Share */}
      <button className="flex flex-col items-center gap-1 group" onClick={async () => {
        try {
          const url = \`\${window.location.origin}/en-vivo/\${item.seller.username}\`;
          if (navigator.share) {
            await navigator.share({
              title: \`Vende Ya En Vivo - \${item.seller.displayName}\`,
              text: '¡Únete a esta transmisión en Vende Ya!',
              url: url,
            })
          } else {
            await navigator.clipboard.writeText(url)
            alert('¡Enlace copiado al portapapeles!')
          }
        } catch (e) {}
      }}>`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code, 'utf8');