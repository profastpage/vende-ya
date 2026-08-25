const fs = require('fs');
const path = require('path');

// Fix LiveHubClient.tsx
let file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/import \{ DynamicHubPlayer \} from '@\/components\/vendeda\/DynamicLivePlayer';\n'use client'/, "'use client'\nimport { DynamicHubPlayer } from '@/components/vendeda/DynamicLivePlayer';");
fs.writeFileSync(file, text, 'utf8');

// Fix LiveRoomClient.tsx
file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
text = fs.readFileSync(file, 'utf8');
text = text.replace(/import \{ DynamicLivePlayer \} from '@\/components\/vendeda\/DynamicLivePlayer';\n'use client'/, "'use client'\nimport { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';");
fs.writeFileSync(file, text, 'utf8');

// Fix SocialVideoFeed.tsx
file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
text = fs.readFileSync(file, 'utf8');
text = text.replace(/import \{ DynamicLivePlayer \} from '@\/components\/vendeda\/DynamicLivePlayer';\n'use client'/, "'use client'\nimport { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer';");
fs.writeFileSync(file, text, 'utf8');

// Fix actions.ts
file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
text = fs.readFileSync(file, 'utf8');
text = text.replace(/export function parseStreamUrl/, 'export async function parseStreamUrl');
fs.writeFileSync(file, text, 'utf8');

console.log('Fixed build errors');