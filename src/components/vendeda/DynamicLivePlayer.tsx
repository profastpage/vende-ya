import React from 'react';

export function DynamicLivePlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const domainParams = `parent=localhost&parent=vende-ya-phi.vercel.app`;
  const containerClasses = "relative w-full h-full bg-black";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={`https://player.twitch.tv/?channel=${providerId}&${domainParams}&muted=false&autoplay=true&playsinline=true`} className="w-full h-full border-none" allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={`https://kick.com/${providerId}/embed`} className="w-full h-full border-none" allowFullScreen />
      </div>
    );
  }

  // Fallback to YouTube
  return (
    <div className={containerClasses}>
      <iframe src={`https://www.youtube.com/embed/${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1`} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}

export function DynamicHubPlayer({ provider, providerId }: { provider: string, providerId: string }) {
  const domainParams = `parent=localhost&parent=vende-ya-phi.vercel.app`;
  const containerClasses = "relative w-full h-full bg-black pointer-events-none";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe src={`https://player.twitch.tv/?channel=${providerId}&${domainParams}&muted=true&autoplay=true&playsinline=true`} className="w-full h-full border-none pointer-events-none" allowFullScreen />
      </div>
    );
  }

  if (provider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe src={`https://kick.com/${providerId}/embed`} className="w-full h-full border-none pointer-events-none" allowFullScreen />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe src={`https://www.youtube.com/embed/${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0`} className="w-full h-full border-none pointer-events-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
    </div>
  );
}