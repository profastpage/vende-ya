const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

// Force Kick to start unmuted if possible, but browsers usually block this.
// There is nothing to change in the code if we just educate the user on the UX flow.
// I will just read the file to confirm it is exactly as expected.
console.log('No code changes needed for this Kick iframe behavior, will advise user.');