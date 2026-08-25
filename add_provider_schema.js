const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /youtubeLiveId   String\?/,
    `youtubeLiveId   String?
  streamProvider  String?  @default("YOUTUBE") // TWITCH | KICK | YOUTUBE
  streamProviderId String?`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added provider fields to schema');