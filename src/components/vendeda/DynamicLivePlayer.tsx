'use client';
import React, { useState, useEffect } from 'react';

interface DynamicLivePlayerProps {
  provider: string;
  providerId: string;
  isActive?: boolean;
}

export function DynamicLivePlayer({ provider, providerId, isActive = true }: DynamicLivePlayerProps) {
  const [canRender, setCanRender] = useState(false);
  const [hostname, setHostname] = useState('vendeya.live');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname || 'vendeya.live');
    }

    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setTimeout(() => setCanRender(true), 300);
    } else {
      setCanRender(false);
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  const cleanId = providerId ? providerId.trim() : '';

  if (!cleanId || cleanId.length < 2) {
    return (
      <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white/50 p-4 text-center">
        <p className="text-sm font-medium text-zinc-400">Transmisión no configurada</p>
      </div>
    );
  }

  if (!canRender) {
    return (
      <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white/50">
        <svg className="w-8 h-8 animate-spin text-amber-400 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-semibold text-zinc-400">Cargando transmisión...</span>
      </div>
    );
  }

  const containerClasses = "relative w-full h-full bg-black pointer-events-auto overflow-hidden";
  const upperProvider = (provider || 'YOUTUBE').toUpperCase();

  if (upperProvider === 'TWITCH') {
    // Twitch requires every parent domain where the iframe is embedded
    const parents = Array.from(new Set([hostname, 'vendeya.live', 'localhost'])).filter(Boolean);
    const parentParams = parents.map(p => `parent=${encodeURIComponent(p)}`).join('&');
    const twitchSrc = `https://player.twitch.tv/?channel=${encodeURIComponent(cleanId)}&${parentParams}&muted=false&autoplay=true&playsinline=true`;

    return (
      <div className={containerClasses}>
        <iframe
          key={`twitch-${cleanId}`}
          className="w-full h-full border-none"
          src={twitchSrc}
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      </div>
    );
  }

  if (upperProvider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe
          key={`kick-${cleanId}`}
          className="w-full h-full border-none"
          src={`https://player.kick.com/${encodeURIComponent(cleanId)}?autoplay=true&muted=false`}
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      </div>
    );
  }

  // Default: YouTube
  return (
    <div className={containerClasses}>
      <iframe
        key={`yt-${cleanId}`}
        className="w-full h-full border-none"
        src={`https://www.youtube.com/embed/${encodeURIComponent(cleanId)}?autoplay=1&mute=0&playsinline=1&controls=1&modestbranding=1&rel=0`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}