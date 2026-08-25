const fs = require('fs');
const path = require('path');

let file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');
text = "import { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';\n" + text;
fs.writeFileSync(file, text, 'utf8');

file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
text = fs.readFileSync(file, 'utf8');
text = "import { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';\n" + text;
text = text.replace(/youtubeLiveId\?: string;/, "youtubeLiveId?: string;\n  streamProvider?: string | null;\n  streamProviderId?: string | null;");
fs.writeFileSync(file, text, 'utf8');

file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
text = fs.readFileSync(file, 'utf8');
text = "import { DynamicHubPlayer } from '@/components/vendeda/DynamicLivePlayer';\n" + text;
fs.writeFileSync(file, text, 'utf8');

console.log('Fixed imports and types');