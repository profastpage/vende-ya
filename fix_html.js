const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /<Label htmlFor="kickUser"[\s\S]*?Usuario de Kick \*<\/Label>/,
    `<Label htmlFor="youtubeUrl" className="text-foreground font-semibold">Enlace de YouTube Live *</Label>`
);

text = text.replace(
    /id="kickUser"[\s\S]*?placeholder="Ej\. mi_canal_oficial"[\s\S]*?value=\{kickUsername\}[\s\S]*?onChange=\{\(e\) => setKickUsername\(e\.target\.value\)\}/,
    `id="youtubeUrl" 
                    placeholder="Ej. https://www.youtube.com/watch?v=..." 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}`
);

// Update instructions
text = text.replace(
    /Cmo transmitir con Kick[\s\S]*?<\/ol>/,
    `Cómo transmitir con YouTube
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Inicia transmisión desde tu app de YouTube o PC.</li>
                    <li><strong className="text-amber-500">👉 RECOMENDACIÓN:</strong> Transmite en vertical (YouTube Shorts) o en horizontal, Vende Ya se adaptará automáticamente.</li>
                    <li>Toca en "Compartir" y copia el enlace.</li>
                    <li>Pega el enlace de YouTube aquí abajo. Nuestro sistema lo conectará mágicamente.</li>
                  </ol>`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed html fields');