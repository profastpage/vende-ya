const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

// Regex util
const regexUtil = `
export function extractYouTubeID(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|live\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (e) {
    return null;
  }
}
`;

text = text.replace(
    /export async function createKickStream/,
    regexUtil + '\nexport async function createYouTubeStream'
);

// Update signature
text = text.replace(
    /createYouTubeStream\(title: string, kickUsername: string, isAuction: boolean, price: number\)/,
    `createYouTubeStream(title: string, youtubeUrl: string, isAuction: boolean, price: number)`
);

// Extract ID and error if invalid
const validation = `
    const videoId = extractYouTubeID(youtubeUrl);
    if (!videoId) {
      return { success: false, error: 'El enlace de YouTube no es válido. Asegúrate de copiar el link correcto (ej: https://www.youtube.com/watch?v=... o https://youtu.be/...)' }
    }
`;

text = text.replace(
    /try \{\r?\n\s*\/\/ 0\. Ensure Profile exists/,
    `try {\n` + validation + `\n    // 0. Ensure Profile exists`
);

// Update stream creation
text = text.replace(
    /kickUsername: kickUsername\.toLowerCase\(\)\.trim\(\)/,
    `youtubeLiveId: videoId,
        kickUsername: null` // clear kick username just in case
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed actions.ts');