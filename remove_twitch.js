const fs = require('fs');
const path = require('path');

// 1. Update actions.ts to only support YouTube
const actionsPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let actionsCode = fs.readFileSync(actionsPath, 'utf8');

actionsCode = actionsCode.replace(/export async function parseStreamUrl[\s\S]*?return null;\n\}/, `export async function parseStreamUrl(url: string) {
  if (url.includes('youtu') || url.includes('youtube')) {
    const ytMatch = url.match(/^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|live\\/|watch\\?v=|\\&v=)([^#\\&\\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) return { provider: 'YOUTUBE', id: ytMatch[2] };
  }
  return null;
}`);

fs.writeFileSync(actionsPath, actionsCode, 'utf8');

// 2. Update DynamicLivePlayer to only render YouTube
const playerPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let playerCode = fs.readFileSync(playerPath, 'utf8');

playerCode = playerCode.replace(/if \(provider === 'TWITCH'\) \{[\s\S]*?if \(provider === 'KICK'\) \{[\s\S]*?if \(provider === 'YOUTUBE'\) \{/, `if (provider === 'YOUTUBE') {`);

fs.writeFileSync(playerPath, playerCode, 'utf8');

console.log("Updated Twitch/Kick removals");