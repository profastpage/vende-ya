const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

// Insert import if missing
if (!text.includes('DynamicLivePlayer')) {
  text = text.replace(/import React.*?from 'react'/, "import React from 'react'\nimport { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer'");
}

// Replace desktop player
text = text.replace(/<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">[\s\S]*?<iframe[\s\S]*?\/>/,
`<div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
            <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />`);

// Replace mobile player
text = text.replace(/<div className="relative w-full h-full">[\s\S]*?<iframe[\s\S]*?\/>/,
`<div className="relative w-full h-full">
            <DynamicLivePlayer provider={stream?.streamProvider || 'YOUTUBE'} providerId={stream?.streamProviderId || stream?.youtubeLiveId || stream?.kickUsername || '21X5lGlDOfg'} />`);

fs.writeFileSync(file, text, 'utf8');