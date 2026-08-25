
'use client';
import React, { useState, useEffect } from 'react';

export function DynamicLivePlayer({ provider, providerId, isActive = true }: { provider: string, providerId: string, isActive?: boolean }) {
  const [hostname, setHostname] = useState('vende-ya-phi.vercel.app');
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      // Delay mounting by 400ms to ensure scroll snap is finished and iframe is 100% visible
      timer = setTimeout(() => setCanRender(true), 400);
    } else {
      // Unmount immediately when out of view
      setCanRender(false);
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  if (!canRender) {
    return (
      <div className="relative w-full h-full bg-black flex flex-col items-center justify-center text-white/50">
        <svg className="w-8 h-8 animate-spin text-white/20 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-medium">Cargando stream...</span>
      </div>
    );
  }

  const domainParams = `parent=localhost&parent=${hostname}`;
  const containerClasses = "relative w-full h-full bg-black";

  if (provider === 'TWITCH') {
    return (
      <div className={containerClasses}>
        <iframe 
          key={`twitch-${providerId}-${Date.now()}`}
          src={`https://player.twitch.tv/?channel=${providerId}&${domainParams}&muted=true&autoplay=true&playsinline=true`} 
          className="w-full h-full border-none" 
          allowFullScreen 
        />
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

  return (
    <div className={containerClasses}>
      <iframe src={`https://www.youtube.com/embed/${providerId}?autoplay=1&mute=1&rel=0&modestbranding=1`} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
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

  const domainParams = `parent=localhost&parent=${hostname}`;
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
