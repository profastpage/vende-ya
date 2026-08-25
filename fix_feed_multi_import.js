const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('DynamicLivePlayer')) {
  text = text.replace(/import React.*?from 'react'/, "import React from 'react'\nimport { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer'");
}

text = text.replace(/\{item\.streamProviderId \|\| item\.youtubeLiveId \|\| item\.kickUsername \? \([\s\S]*?<div className="relative w-full h-full">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{item.streamProviderId || item.youtubeLiveId || item.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full">
                <DynamicLivePlayer provider={item.streamProvider || 'YOUTUBE'} providerId={item.streamProviderId || item.youtubeLiveId || item.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

// Try fallback regex in case the previous one missed because of old kick code
text = text.replace(/\{item\.youtubeLiveId \|\| item\.kickUsername \? \([\s\S]*?<div className="relative w-full h-full">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{item.streamProviderId || item.youtubeLiveId || item.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full">
                <DynamicLivePlayer provider={item.streamProvider || 'YOUTUBE'} providerId={item.streamProviderId || item.youtubeLiveId || item.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

fs.writeFileSync(file, text, 'utf8');