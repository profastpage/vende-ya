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
  immediate?: boolean;
}

export function DynamicLivePlayer({
  provider,
  providerId,
  isActive = true,
  isMuted = false,
  pointerEvents = 'auto',
  fillMode = 'contain',
  className = '',
  immediate = false,
}: DynamicLivePlayerProps) {
  const [canRender, setCanRender] = useState(immediate || false);

  useEffect(() => {
    if (immediate && isActive) {
      setCanRender(true);
      return;
    }

    let timer: NodeJS.Timeout;
    if (isActive) {
      // Delay mounting slightly (150ms) in feed to ensure smooth scroll snap without lag
      timer = setTimeout(() => setCanRender(true), 150);
    } else {
      setCanRender(false);
    }
    return () => clearTimeout(timer);
  }, [isActive, immediate]);

  const cleanId = providerId ? providerId.trim() : '';
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Send mute/unmute command via postMessage without remounting iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const func = isMuted ? 'mute' : 'unMute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args: '' }),
        '*'
      );
    } catch {}
  }, [isMuted]);

  if (!cleanId || cleanId.length < 2) {
    return null;
  }

  if (!canRender) {
    return null;
  }

  const pointerClass = pointerEvents === 'none' ? 'pointer-events-none' : 'pointer-events-auto';
  const containerClasses = `relative w-full h-full bg-black overflow-hidden select-none ${pointerClass} ${className}`;

  // When fillMode is 'cover', scale video slightly oversized (124%) and centered to push YouTube title bar and controls off-screen
  const iframeClasses =
    fillMode === 'cover'
      ? `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[124%] min-w-[124%] aspect-video max-w-none border-none origin-center select-none ${pointerClass}`
      : `w-full h-full border-none select-none ${pointerClass}`;

  const upperProvider = (provider || 'YOUTUBE').toUpperCase();

  if (upperProvider === 'KICK') {
    return (
      <div className={containerClasses}>
        <iframe
          ref={iframeRef}
          key={`kick-${cleanId}`}
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

  // Default: YouTube (with enablejsapi=1 for dynamic mute/unmute control)
  return (
    <div className={containerClasses}>
      <iframe
        ref={iframeRef}
        key={`yt-${cleanId}`}
        className={iframeClasses}
        src={`https://www.youtube.com/embed/${encodeURIComponent(
          cleanId
        )}?enablejsapi=1&autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&fs=0&loop=1&playlist=${encodeURIComponent(
          cleanId
        )}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}