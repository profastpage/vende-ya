const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/import React from 'react';/, "import React from 'react';\nimport { headers } from 'next/headers';");

text = text.replace(/const domainParams = `parent=localhost&parent=vende-ya-phi\.vercel\.app`;/g, 
`const headersList = headers();
  const host = headersList.get('host') || 'localhost';
  // Twitch doesn't want ports in the parent domain, just the hostname
  const currentDomain = host.split(':')[0];
  const domainParams = \`parent=\${currentDomain}\`;`);

fs.writeFileSync(file, text, 'utf8');