const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /const \[kickUsername, setKickUsername\] = React\.useState\(''\)/,
    `const [youtubeUrl, setYoutubeUrl] = React.useState('')`
);

text = text.replace(
    /if \(!title \|\| !price \|\| \(isLive && !kickUsername\)\) \{[\s\S]*?\}\r?\n/,
    `if (!title || !price || (isLive && !youtubeUrl)) {
        toast({ title: 'Error', description: 'Todos los campos son obligatorios, y si es en vivo, el enlace de YouTube.', variant: 'destructive' })
        return
      }
`
);

text = text.replace(
    /const res = await createKickStream\(title, kickUsername, isAuction, Number\(price\)\)/,
    `const res = await createYouTubeStream(title, youtubeUrl, isAuction, Number(price))`
);

text = text.replace(
    /tu usuario de\r?\n\s*Kick\./,
    `el enlace de YouTube.`
);

text = text.replace(
    /Tu transmisin de Kick ha sido enlazada a Vende Ya exitosamente./,
    `Tu transmisión de YouTube ha sido enlazada a Vende Ya exitosamente.`
);

// Update HTML form fields
text = text.replace(
    /<Label htmlFor="kickUser">Usuario de Kick<\/Label>/,
    `<Label htmlFor="youtubeUrl">Enlace de YouTube Live</Label>`
);

text = text.replace(
    /id="kickUser"\r?\n\s*placeholder="Ej\. mi_canal_oficial"\r?\n\s*value=\{kickUsername\}\r?\n\s*onChange=\{\(e\) => setKickUsername\(e\.target\.value\)\}/,
    `id="youtubeUrl" 
                      placeholder="Ej. https://www.youtube.com/watch?v=..." 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}`
);

// Imports
text = text.replace(
    /import \{ createKickStream \} from '\.\/actions'/,
    `import { createYouTubeStream } from './actions'`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed vender page.tsx');