const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
    /import \* as React from 'react'/,
    `import * as React from 'react'\nimport { createBrowserClient } from '@supabase/ssr'`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed imports forced');