const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\DynamicLivePlayer.tsx');

let text = `
'use client';
import React, { useState, useEffect } from 'react';

export function DynamicLivePlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const [hostname, setHostname] = useState('vende-ya-phi.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  const domainParams = \`parent=localhost&parent=\${hostname}\`;
  const containerClasses = "relative w-full h-full bg-black";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://player.twitch.tv/?channel=\${providerId}&\${domainParams}&muted=false&autoplay=true&playsinline=true\`} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://kick.com/\${providerId}/embed\`} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe src={\`https://www.youtube.com/embed/\${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1\`} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}

export function DynamicHubPlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const [hostname, setHostname] = useState('vende-ya-phi.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  const domainParams = \`parent=localhost&parent=\${hostname}\`;
  const containerClasses = "relative w-full h-full bg-black pointer-events-none";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://player.twitch.tv/?channel=\${providerId}&\${domainParams}&muted=true&autoplay=true&playsinline=true\`} className="w-full h-full border-none pointer-events-none" allowFullScreen />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={\`https://kick.com/\${providerId}/embed\`} className="w-full h-full border-none pointer-events-none" allowFullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe src={\`https://www.youtube.com/embed/\${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0\`} className="w-full h-full border-none pointer-events-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}
`;

fs.writeFileSync(file, text, 'utf8');