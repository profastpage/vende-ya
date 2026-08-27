const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /<p className="text-xs text-white\/30 mt-1">ID invǭlido o stream finalizado<\/p>/,
  `<p className="text-xs text-white/30 mt-1">ID inválido o stream finalizado</p>\n                  <p className="text-xs text-white/30 mt-1 font-mono">DEBUG: videoId={JSON.stringify(videoId)} len={videoId?.length}</p>`
);

text = text.replace(
  /const isValidYoutubeId = videoId && videoId\.length === 11;/,
  "const isValidYoutubeId = videoId && (videoId.length === 11 || videoId.length > 0);" // Temporarily allow ANY length just to force the iframe to render
);

fs.writeFileSync(file, text, 'utf8');