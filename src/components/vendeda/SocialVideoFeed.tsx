'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart, MessageCircle, Share2, Plus, Volume2, VolumeX, Eye, Radio,
} from 'lucide-react'
import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'
import { InStreamCheckoutDrawer } from './InStreamCheckoutDrawer'
import { DynamicLivePlayer } from '@/components/vendeda/DynamicLivePlayer'
import { formatPEN } from '@/lib/vendeda/format'
import { DEFAULT_STREAM_COVER } from '@/lib/vendeda/images'
import { cn } from '@/lib/utils'

export type SocialFeedItem = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  kickUsername?: string;
  youtubeLiveId?: string;
  streamProvider?: string | null;
  streamProviderId?: string | null;
  seller: { username: string; displayName: string; avatarUrl?: string };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  product?: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
  };
  liveComments?: { id: string; user: string; text: string }[];
}

interface SocialVideoFeedProps {
  feed: SocialFeedItem[];
}

export function SocialVideoFeed({ feed }: SocialVideoFeedProps) {
  const viewersMap = useMultiLiveViewers(feed.map(f => ({ id: f.id, viewerCount: 0 })))

  return (
    <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
      {/* Main Feed Container */}
      <div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-auto overscroll-none no-scrollbar relative flex flex-col items-center touch-pan-y">
        {feed.map((item) => (
          <FeedItem key={item.id} item={item} viewers={viewersMap[item.id] || 0} />
        ))}
      </div>
    </div>
  )
}

function FeedItem({ item, viewers = 0 }: { item: SocialFeedItem; viewers?: number }) {
  const router = useRouter()
  const [isActive, setIsActive] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsActive(entry.isIntersecting)
        })
      },
      { threshold: 0.6 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const provider = item.streamProvider || (item.youtubeLiveId ? 'YOUTUBE' : item.kickUsername ? 'KICK' : 'YOUTUBE')
  const providerId = item.streamProviderId || item.youtubeLiveId || item.kickUsername || ''
  const hasLiveVideo = Boolean(providerId && providerId.trim().length >= 2)
  const hasDirectVideo = Boolean(
    item.videoUrl &&
    item.videoUrl.startsWith('http') &&
    (item.videoUrl.endsWith('.mp4') || item.videoUrl.endsWith('.webm') || item.videoUrl.includes('.m3u8'))
  )
  const coverImage = item.thumbnailUrl || item.product?.thumbnail || DEFAULT_STREAM_COVER

  const navigateToRoom = () => {
    router.push(`/en-vivo/${item.seller.username}`)
  }

  return (
    <div ref={containerRef} className="relative w-full md:w-auto h-full snap-center snap-always flex justify-center shrink-0 md:py-4">
      {/* Container that acts as the mobile screen on desktop */}
      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-zinc-950 md:rounded-2xl overflow-hidden flex shrink-0 shadow-2xl border border-white/5">
        
        {/* Layer 1: Poster / Thumbnail Fallback Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </div>

        {/* Layer 2: Natural Live Video Stream (eBay Live / TikTok Live style) */}
        {isActive && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {hasDirectVideo ? (
              <video
                src={item.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : hasLiveVideo ? (
              <DynamicLivePlayer
                provider={provider}
                providerId={providerId}
                isActive={isActive}
                isMuted={isMuted}
                pointerEvents="none"
                fillMode="cover"
              />
            ) : null}
          </div>
        )}

        {/* Layer 3: Subtle Top & Bottom Gradients for UI clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none z-10" />

        {/* Layer 4: Tap-anywhere to enter the Live Room */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={navigateToRoom}
          aria-label={`Entrar a la transmisión de ${item.seller.displayName}`}
        />

        {/* Top Badges & Audio Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* LIVE + Viewers Badge */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-rose-600/90 backdrop-blur-md border border-rose-400/30 rounded-full px-3 py-1 shadow-lg shadow-rose-600/30">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                EN VIVO
              </span>
            </div>
            {viewers > 0 && (
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-white text-[11px] font-bold">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{viewers}</span>
              </div>
            )}
          </div>

          {/* Audio Mute/Unmute Toggle Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {hasLiveVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMuted(!isMuted)
                }}
                className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all shadow-lg active:scale-90"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white/80" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Enter Room Pill Button (Subtle guidance) */}
        <div className="absolute top-16 left-4 z-20 pointer-events-none">
          <button
            onClick={navigateToRoom}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold transition-colors shadow-md"
          >
            <span>Toca para interactuar</span>
            <span className="text-amber-400">→</span>
          </button>
        </div>

        {/* Bottom Info & Product Pin */}
        <div className="absolute bottom-4 left-4 right-16 flex flex-col justify-end gap-3 z-20 pb-16 md:pb-4 md:right-4 pointer-events-none">
          {/* Clickable Product Pin */}
          {item.product && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-auto flex items-center gap-3 bg-muted/90 backdrop-blur-md p-2 rounded-xl border border-border shadow-lg w-fit max-w-[90%] cursor-pointer hover:bg-muted transition-colors"
            >
              <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-foreground text-xs font-medium line-clamp-1">{item.product.title}</span>
                <span className="text-[#FE2C55] font-bold text-sm">{formatPEN(item.product.price)}</span>
              </div>
              <InStreamCheckoutDrawer product={item.product} />
            </motion.div>
          )}

          {/* Stream Info */}
          <div className="pointer-events-auto" onClick={navigateToRoom}>
            <h3 className="text-white font-bold text-base drop-shadow-md hover:underline cursor-pointer">@{item.seller.displayName}</h3>
            <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow-md">{item.description}</p>
          </div>

          {/* Live Comments Stream */}
          {item.liveComments && item.liveComments.length > 0 && (
            <div className="h-20 overflow-y-hidden pointer-events-none space-y-1.5 mt-2" style={{ maskImage: 'linear-gradient(to top, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)' }}>
              {item.liveComments.slice(0, 3).map(comment => (
                <div key={comment.id} className="text-[12px] leading-tight">
                  <span className="font-bold text-white/80 drop-shadow-md">{comment.user}: </span>
                  <span className="text-white drop-shadow-md">{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Right Interaction Panel */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5 z-20 md:hidden pointer-events-auto">
          <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={true} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
        </div>
      </div>

      {/* Desktop Right Interaction Panel */}
      <div className="hidden md:flex flex-col items-center gap-5 z-20 ml-4 self-end pb-8 pointer-events-auto">
        <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={false} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
      </div>
    </div>
  )
}

function InteractionButtons({
  item,
  isLiked,
  setIsLiked,
  isMobile,
}: {
  item: SocialFeedItem;
  isLiked: boolean;
  setIsLiked: (v: boolean) => void;
  isMobile: boolean;
  isZoomed: boolean;
  setIsZoomed: (v: boolean) => void;
}) {
  return (
    <>
      {/* Avatar */}
      <div className="relative">
        <div className={cn("w-12 h-12 rounded-full border-2 overflow-hidden", isMobile ? "border-white bg-zinc-800" : "border-background bg-muted")}>
          {item.seller.avatarUrl ? (
            <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center font-bold", isMobile ? "text-white" : "text-foreground")}>{item.seller.displayName[0]}</div>
          )}
        </div>
        <button className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full p-0.5 border-2", isMobile ? "border-black" : "border-background")}>
          <Plus className="w-3 h-3 text-foreground" />
        </button>
      </div>

      {/* Like */}
      <button className="flex flex-col items-center gap-1 group" onClick={() => setIsLiked(!isLiked)}>
        <div className={`p-2 rounded-full ${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.likes + (isLiked ? 1 : 0)}</span>
      </button>

      {/* Comments */}
      <button className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-full ${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <MessageCircle className={`w-6 h-6 md:w-7 md:h-7 ${isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.comments}</span>
      </button>

      {/* Share */}
      <button className="flex flex-col items-center gap-1 group" onClick={async () => {
        try {
          const url = `${window.location.origin}/en-vivo/${item.seller.username}`;
          if (navigator.share) {
            await navigator.share({
              title: `Vende Ya En Vivo - ${item.seller.displayName}`,
              text: '¡Únete a esta transmisión en Vende Ya!',
              url: url,
            })
          } else {
            await navigator.clipboard.writeText(url)
            alert('¡Enlace copiado al portapapeles!')
          }
        } catch (e) {}
      }}>
        <div className={`p-2 rounded-full ${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <Share2 className={`w-6 h-6 md:w-7 md:h-7 ${isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.shares}</span>
      </button>
    </>
  )
}
