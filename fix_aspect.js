const fs = require('fs');
const path = require('path');

// 1. Fix SocialVideoFeed
let file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/<div className="relative w-full aspect-video">/, '<div className="relative w-full h-full">');
fs.writeFileSync(file, text, 'utf8');

// 2. Fix LiveRoomClient (mobile layout only)
file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
text = fs.readFileSync(file, 'utf8');
// The mobile layout has <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">\n<div className="relative w-full aspect-video">
text = text.replace(/<div className="absolute inset-0 z-0 bg-black flex items-center justify-center">\s*<div className="relative w-full aspect-video">/, 
`<div className="absolute inset-0 z-0 bg-black">
          <div className="relative w-full h-full">`);
fs.writeFileSync(file, text, 'utf8');

console.log('Changed aspect-video to h-full for mobile views');