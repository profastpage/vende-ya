'use client';
import React, { useState, useEffect } from 'react';

export function DynamicLivePlayer({ provider, providerId, isActive = true }: { provider: string, providerId: string, isActive?: boolean }) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setTimeout(() => setCanRender(true), 400);
    } else {
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

  const containerClasses = "relative w-full h-full bg-black pointer-events-auto";

  if (provider === 'YOUTUBE' || provider === 'youtube') {
    return (
      <div className={containerClasses}>
        <iframe
          key={`yt-${providerId}`}
          className="w-full h-full border-none pointer-events-auto"
          src={`https://www.youtube.com/embed/${providerId}?autoplay=1&mute=1&playsinline=1&controls=0&modestbranding=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: 'auto' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center">
      <p>Proveedor de stream no soportado.</p>
    </div>
  );
}