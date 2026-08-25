const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/kickUsername: stream\.kickUsername \|\| undefined,/g,
`kickUsername: stream.kickUsername || undefined,
      youtubeLiveId: stream.youtubeLiveId || undefined,
      streamProvider: stream.streamProvider || undefined,
      streamProviderId: stream.streamProviderId || undefined,`);

fs.writeFileSync(file, text, 'utf8');