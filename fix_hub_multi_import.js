const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('DynamicHubPlayer')) {
  text = text.replace(/import React.*?from 'react'/, "import React from 'react'\nimport { DynamicHubPlayer } from '@/components/vendeda/DynamicLivePlayer'");
}

// Hero iframe
text = text.replace(/\{stream\.streamProviderId \|\| stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<div className="relative w-full aspect-video pointer-events-none">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <div className="relative w-full aspect-video pointer-events-none">
              <DynamicHubPlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
            </div>
          </div>
        ) : (`);
        
text = text.replace(/\{stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<div className="relative w-full aspect-video pointer-events-none">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <div className="relative w-full aspect-video pointer-events-none">
              <DynamicHubPlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
            </div>
          </div>
        ) : (`);

// Card iframe
text = text.replace(/\{stream\.streamProviderId \|\| stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<div className="relative w-full h-full pointer-events-none">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full pointer-events-none">
                <DynamicHubPlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

text = text.replace(/\{stream\.youtubeLiveId \|\| stream\.kickUsername \? \([\s\S]*?<div className="relative w-full h-full pointer-events-none">[\s\S]*?<iframe[\s\S]*?\/>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*\) : \(/,
`{stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername ? (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              <div className="relative w-full h-full pointer-events-none">
                <DynamicHubPlayer provider={stream.streamProvider || 'YOUTUBE'} providerId={stream.streamProviderId || stream.youtubeLiveId || stream.kickUsername || ''} />
              </div>
            </div>
          ) : (`);

fs.writeFileSync(file, text, 'utf8');