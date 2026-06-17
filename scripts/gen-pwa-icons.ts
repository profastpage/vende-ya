/**
 * Generate PWA icons (192, 512, maskable 512) from a simple SVG.
 * Output: /public/icon-{192,512}.png + /public/icon-maskable-512.png
 *
 * Run: bun /home/z/my-project/scripts/gen-pwa-icons.ts
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const OUT = '/home/z/my-project/public'
mkdirSync(OUT, { recursive: true })

// Brand SVG: rounded square with gradient + white "V" letter
const makeSvg = (size: number, padding = 0): string => {
  const inner = size - padding * 2
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7A3F"/>
      <stop offset="100%" stop-color="#D8451A"/>
    </linearGradient>
  </defs>
  ${padding > 0
    ? `<rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${inner * 0.18}" fill="url(#g)"/>`
    : `<rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#g)"/>`
  }
  <text x="50%" y="50%" dy="0.06em" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, sans-serif" font-weight="900" font-size="${size * 0.6}" fill="#FFFFFF">V</text>
</svg>`
}

async function gen() {
  // Standard icons (192, 512)
  for (const size of [192, 512]) {
    const svg = Buffer.from(makeSvg(size))
    await sharp(svg).png().toFile(join(OUT, `icon-${size}.png`))
    console.log(`✓ icon-${size}.png`)
  }
  // Maskable icon (needs safe padding for adaptive UI)
  const maskableSvg = Buffer.from(makeSvg(512, 64))
  await sharp(maskableSvg).png().toFile(join(OUT, 'icon-maskable-512.png'))
  console.log('✓ icon-maskable-512.png')

  // Apple touch icon (180x180, no transparency)
  const appleSvg = Buffer.from(makeSvg(180))
  await sharp(appleSvg).png().toFile(join(OUT, 'apple-touch-icon.png'))
  console.log('✓ apple-touch-icon.png')

  // Favicon (32x32)
  const favSvg = Buffer.from(makeSvg(32))
  await sharp(favSvg).png().toFile(join(OUT, 'favicon-32.png'))
  console.log('✓ favicon-32.png')
}

gen().catch(console.error)
