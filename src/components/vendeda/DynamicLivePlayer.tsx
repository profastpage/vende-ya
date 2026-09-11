'use client';
import React, { useState, useEffect } from 'react';

interface DynamicLivePlayerProps {
  provider: string;
  providerId: string;
  isActive?: boolean;
  isMuted?: boolean;
  pointerEvents?: 'none' | 'auto';
  fillMode?: 'cover' | 'contain';
  className?: string;
}

export function DynamicLivePlayer({
  provider,
  providerId,
  isActive = true,
  isMuted = false,
  pointerEvents = 'auto',
  fillMode = 'contain',
  className = '',
}: DynamicLivePlayerProps) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {

    let timer: NodeJS.Timeout;
    if (isActive) {
      // Delay mounting slightly (200ms) to ensure smooth scroll snap without lag
      timer = setTimeout(() => setCanRender(true), 200);
    } else {
      setCanRender(false);
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  const cleanId = providerId ? providerId.trim() : '';

  if (!cleanId || cleanId.length < 2) {
    return null;
  }

  if (!canRender) {
    return null;
  }

  const pointerClass = pointerEvents === 'none' ? 'pointer-events-none' : 'pointer-events-auto';
  const containerClasses = `relative w-full h-full bg-black overflow-hidden ${pointerClass} ${className}`;

  // When fillMode is 'cover', scale 16:9 video to cover 9:16 vertical container perfectly without letterboxing
  const iframeClasses =
    fillMode === 'cover'
      ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full aspect-video min-w-full max-w-none border-none'
      : 'w-full h-full border-none';

  const upperProvider = (provider || 'YOUTUBE').toUpperCase();

  if (upperProvider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe
          key={`kick-${cleanId}-${isMuted}`}
          className={iframeClasses}
          src={`https://player.kick.com/${encodeURIComponent(cleanId)}?autoplay=true&muted=${
            isMuted ? 'true' : 'false'
          }`}
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
        key={`yt-${cleanId}-${isMuted}`}
        className={iframeClasses}
        src={`https://www.youtube.com/embed/${encodeURIComponent(
          cleanId
        )}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&loop=1&playlist=${encodeURIComponent(
          cleanId
        )}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}