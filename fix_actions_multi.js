const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

const parserLogic = `
export function parseStreamUrl(url: string) {
  if (url.includes('twitch.tv/')) {
    return { provider: 'TWITCH', id: url.split('twitch.tv/')[1].split('/')[0].split('?')[0] };
  }
  if (url.includes('kick.com/')) {
    return { provider: 'KICK', id: url.split('kick.com/')[1].split('/')[0].split('?')[0] };
  }
  if (url.includes('youtu') || url.includes('youtube')) {
    const ytMatch = url.match(/^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|live\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) return { provider: 'YOUTUBE', id: ytMatch[2] };
  }
  return null;
}
`;

// Replace extractYouTubeID with parseStreamUrl
text = text.replace(/function extractYouTubeID[\s\S]*?\}/, parserLogic);

// Replace createYouTubeStream with createMultiStream
text = text.replace(/export async function createYouTubeStream\(title: string, youtubeUrl: string, isAuction: boolean, price: number\) \{/,
`export async function createMultiStream(title: string, streamUrl: string, isAuction: boolean, price: number) {`);

// Replace validation logic
text = text.replace(/const videoId = extractYouTubeID[\s\S]*?\}/,
`const parsedStream = parseStreamUrl(streamUrl);
    if (!parsedStream) {
      return { success: false, error: 'El enlace no es vǭlido. Pega una URL correcta de Twitch, Kick o YouTube.' }
    }`);

// Replace stream creation payload
text = text.replace(/youtubeLiveId: videoId,[\s\S]*?kickUsername: null/,
`youtubeLiveId: parsedStream.provider === 'YOUTUBE' ? parsedStream.id : null,
        kickUsername: parsedStream.provider === 'KICK' ? parsedStream.id : null,
        streamProvider: parsedStream.provider,
        streamProviderId: parsedStream.id`);

text = text.replace(/Producto vendido en transmisin en vivo por YouTube/, 'Producto vendido en transmisión en vivo');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed actions');