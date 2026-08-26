const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\next.config.ts');
let text = fs.readFileSync(file, 'utf8');

const regex = /remotePatterns: \[\s*\{ protocol: "https", hostname: "images\.unsplash\.com" \},/;
const replacement = `remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },`;

text = text.replace(regex, replacement);

fs.writeFileSync(file, text, 'utf8');