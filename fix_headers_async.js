const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/export function DynamicLivePlayer/g, 'export async function DynamicLivePlayer');
text = text.replace(/export function DynamicHubPlayer/g, 'export async function DynamicHubPlayer');
text = text.replace(/const headersList = headers\(\);/g, 'const headersList = await headers();');

fs.writeFileSync(file, text, 'utf8');