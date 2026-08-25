const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import \{ createYouTubeStream \} from '\.\/actions'/, `import { createMultiStream } from './actions'`);

text = text.replace(/const \[youtubeUrl, setYoutubeUrl\] = React\.useState\(''\)/, `const [streamUrl, setStreamUrl] = React.useState('')`);

text = text.replace(/isLive && !youtubeUrl/, `isLive && !streamUrl`);
text = text.replace(/el enlace de YouTube/, `el enlace de tu transmisión`);

text = text.replace(/createYouTubeStream\(title, youtubeUrl, isAuction, Number\(price\)\)/, `createMultiStream(title, streamUrl, isAuction, Number(price))`);
text = text.replace(/Tu transmisión de YouTube ha sido enlazada a Vende Ya exitosamente\./, `Tu transmisión ha sido enlazada a Vende Ya exitosamente.`);

text = text.replace(/Enlace de YouTube Live \*/, `Enlace de tu transmisión (Twitch, Kick o YouTube) *`);

text = text.replace(/id="youtubeUrl"[\s\S]*?value=\{youtubeUrl\}[\s\S]*?onChange=\{\(e\) => setYoutubeUrl\(e\.target\.value\)\}/,
`id="streamUrl" 
                      placeholder="Ej. https://twitch.tv/mi_canal" 
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}`);

// Instructions
text = text.replace(/<div className="rounded-xl bg-muted border border-border p-4 text-sm">[\s\S]*?<\/div>/,
`<div className="rounded-xl bg-muted border border-border p-4 text-sm">
                    <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      🎥 Cómo transmitir
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                      <li>Inicia transmisión en tu plataforma favorita (Twitch, Kick o YouTube).</li>
                      <li><strong className="text-amber-500">👉 RECOMENDACIÓN:</strong> Transmite en vertical desde tu celular para una mejor experiencia móvil de tus compradores.</li>
                      <li>Copia el enlace de tu transmisión.</li>
                      <li>Pégalo aquí abajo y nuestro sistema lo auto-detectará.</li>
                    </ol>
                  </div>`);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed vender page');