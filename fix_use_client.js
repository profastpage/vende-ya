const fs = require('fs');
const path = require('path');
const file1 = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text1 = fs.readFileSync(file1, 'utf8');

text1 = text1.replace("import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'\n'use client'", "'use client'\nimport { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'");

fs.writeFileSync(file1, text1, 'utf8');

const file2 = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\hooks\\useMultiLiveViewers.ts');
let text2 = fs.readFileSync(file2, 'utf8');

text2 = "'use client'\n" + text2;
fs.writeFileSync(file2, text2, 'utf8');

console.log('Fixed use client');