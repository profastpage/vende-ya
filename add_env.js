const fs = require('fs');
const path = require('path');
const envFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\.env');
const exampleFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\.env.example');

let envText = fs.readFileSync(envFile, 'utf8');
let exampleText = fs.readFileSync(exampleFile, 'utf8');

const urlMatch = exampleText.match(/NEXT_PUBLIC_SUPABASE_URL=".*"/);
const anonMatch = exampleText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=".*"/);

if (urlMatch && anonMatch) {
  envText += '\n' + urlMatch[0] + '\n' + anonMatch[0] + '\n';
  fs.writeFileSync(envFile, envText, 'utf8');
  console.log('Added Supabase keys to .env');
} else {
  console.log('Could not find keys in example');
}