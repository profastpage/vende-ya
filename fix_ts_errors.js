const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// Fix 1: authUser as unknown as Profile
text = text.replace(/const user: Profile = authUser as Profile/, 'const user: Profile = authUser as unknown as Profile');

// Fix 2: data?.reviews -> (data as any)?.reviews
text = text.replace(/reviews=\{data\?\.reviews \?\? \[\]\}/g, 'reviews={(data as any)?.reviews ?? []}');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed TypeScript errors');