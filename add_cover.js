const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let code = fs.readFileSync(file, 'utf8');

// Add coverImage state
code = code.replace(/const \[streamUrl, setStreamUrl\] = React\.useState\(''\)/, 
`const [streamUrl, setStreamUrl] = React.useState('')
  const [coverImage, setCoverImage] = React.useState('')`);

// Add handleCoverUpload
const uploadLogic = `
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convert to WebP using Canvas
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        // Target 9:16 ratio (e.g. 720x1280)
        const targetWidth = 720
        const targetHeight = 1280
        canvas.width = targetWidth
        canvas.height = targetHeight

        // Cover logic (crop to fill)
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
        const x = (targetWidth / scale - img.width) / 2
        const y = (targetHeight / scale - img.height) / 2

        ctx?.drawImage(img, x, y, img.width, img.height, 0, 0, targetWidth, targetHeight)
        
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8)
        setCoverImage(webpDataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }
`;
code = code.replace(/const handleSubmit = async \(e: React\.FormEvent\) => \{/, `${uploadLogic}\n  const handleSubmit = async (e: React.FormEvent) => {`);

// Add UI
const uiTarget = `<Input 
                      id="streamUrl" 
                      placeholder="Ej. https://youtube.com/live/xxxxxx" 
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      className="h-11 bg-background"
                    />
                  </div>`;
const uiReplacement = `<Input 
                      id="streamUrl" 
                      placeholder="Ej. https://youtube.com/live/xxxxxx" 
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      className="h-11 bg-background"
                    />
                  </div>
                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    <Label className="text-foreground font-semibold">Portada Vertical (Opcional) *</Label>
                    <div className="flex items-center gap-4">
                      {coverImage ? (
                        <div className="relative aspect-[9/16] w-24 rounded-lg overflow-hidden border border-border">
                          <img src={coverImage} alt="Portada" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setCoverImage('')} className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/80 z-10 flex items-center justify-center">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-[9/16] w-24 rounded-lg border-2 border-dashed border-amber-400/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted hover:border-amber-400 transition-colors cursor-pointer bg-amber-400/5">
                          <ImageIcon className="h-6 w-6 text-amber-400/70" />
                          <span className="text-[10px] font-semibold text-amber-400 text-center leading-tight">Subir<br/>9:16</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                        </label>
                      )}
                      <p className="text-xs text-muted-foreground flex-1">
                        Se convertirá automáticamente a WebP sin pérdida. Aparecerá de fondo en el feed inmersivo.
                      </p>
                    </div>
                  </div>`;
code = code.replace(uiTarget, uiReplacement);

// Make sure ImageIcon and X are imported if missing
if (!code.includes('ImageIcon')) {
  code = code.replace(/import \{/, 'import { ImageIcon, X,');
}

// Pass coverImage to createMultiStream
code = code.replace(/const res = await createMultiStream\(title, streamUrl, isAuction, Number\(price\)\)/, `const res = await createMultiStream(title, streamUrl, isAuction, Number(price), coverImage)`);

fs.writeFileSync(file, code, 'utf8');