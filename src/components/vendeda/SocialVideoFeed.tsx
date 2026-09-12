'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart, MessageCircle, Share2, Plus, Volume2, VolumeX, Eye, ShieldAlert, Loader2
} from 'lucide-react'
import { useAuth } from '@/components/vendeda/AuthProvider'
import { killStream, suspendSellerAndKillStream } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'
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
    isAuction?: boolean;
  };
  liveComments?: { id: string; user: string; text: string }[];
}

interface SocialVideoFeedProps {
  feed: SocialFeedItem[];
}

export function SocialVideoFeed({ feed }: SocialVideoFeedProps) {
  const router = useRouter()
  const viewersMap = useMultiLiveViewers(feed.map(f => ({ id: f.id, viewerCount: 0 })))
  const [isMuted, setIsMuted] = React.useState(true)

  // Prefetch live stream routes for all items in feed so navigation is instantaneous
  React.useEffect(() => {
    feed.forEach((item) => {
      if (item.seller?.username) {
        router.prefetch(`/en-vivo/${item.seller.username}`)
      }
    })
  }, [feed, router])

  return (
    <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
      {/* Main Feed Container */}
      <div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-auto overscroll-none no-scrollbar relative flex flex-col items-center touch-pan-y">
        {feed.map((item) => (
          <FeedItem 
            key={item.id} 
            item={item} 
            viewers={viewersMap[item.id] || 0} 
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />
        ))}
      </div>
    </div>
  )
}

function FeedItem({ 
  item, 
  viewers = 0,
  isMuted,
  setIsMuted,
}: { 
  item: SocialFeedItem; 
  viewers?: number;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter()
  const { user } = useAuth()
  const isSuperAdmin = user?.email === 'profastpage@gmail.com'

  const handleAdminKillInFeed = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmAction = confirm(`¿Super Admin: Deseas FINALIZAR la transmisión de @${item.seller.username}?`)
    if (!confirmAction) return
    try {
      await killStream(item.id)
      toast.success('Transmisión finalizada con éxito')
      router.refresh()
    } catch(err: any) {
      toast.error(err.message || 'Error al finalizar')
    }
  }

  const [isActive, setIsActive] = React.useState(false)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Prefetch route on mount for zero-latency entrance
  React.useEffect(() => {
    if (item.seller?.username) {
      router.prefetch(`/en-vivo/${item.seller.username}`)
    }
  }, [item.seller?.username, router])

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
    setIsNavigating(true)
    router.push(`/en-vivo/${item.seller.username}`)
  }

  return (
    <div ref={containerRef} className="relative w-full md:w-auto h-full snap-center snap-always flex justify-center shrink-0 md:py-4">
      {/* Container that acts as the mobile screen on desktop */}
      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-zinc-950 md:rounded-2xl overflow-hidden flex shrink-0 shadow-2xl border border-white/5">
        
        {/* Layer 1: Poster / Thumbnail Fallback Background with safe onError */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950">
          <img
            src={coverImage}
            alt={item.description || 'Live Stream'}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_STREAM_COVER
            }}
            className="w-full h-full object-cover transition-transform duration-700 scale-105"
            loading="eager"
          />
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none z-10" />

        {/* Layer 4: Tap-anywhere to enter the Live Room (Immediate prefetch link with 0ms feedback) */}
        <Link 
          href={`/en-vivo/${item.seller.username}`}
          prefetch={true}
          onClick={() => setIsNavigating(true)}
          className="absolute inset-0 z-[15] cursor-pointer"
          aria-label={`Entrar a la transmisión de ${item.seller.displayName}`}
        >
          {isNavigating && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 transition-opacity animate-in fade-in duration-100">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 text-zinc-100 shadow-xl">
                Entrando al Live...
              </span>
            </div>
          )}
        </Link>

        {/* Top Badges & Audio Controls */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
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

          {/* Audio Mute/Unmute Toggle & Super Admin Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleAdminKillInFeed}
                className="p-2.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black border border-amber-300 shadow-lg active:scale-90 transition-all font-bold"
                title="Super Admin: Finalizar este Live"
                aria-label="Super Admin: Finalizar este Live"
              >
                <ShieldAlert className="w-5 h-5 text-black" />
              </button>
            )}
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

        {/* Bottom Info & Product Pin */}
        <div className="absolute bottom-3 left-3.5 right-16 flex flex-col justify-end gap-2.5 z-20 pointer-events-none">
          {/* Clickable Product Pin — Estilo TikTok / eBay Live */}
          {item.product && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/productos/${item.product!.id}`)
              }}
              className="pointer-events-auto flex items-center gap-2 bg-black/75 hover:bg-black/90 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-xl w-fit max-w-[85%] sm:max-w-[80%] cursor-pointer transition-all active:scale-95"
              title={`Ver detalles de ${item.product.title}`}
            >
              <img src={item.product.thumbnail} alt={item.product.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10" />
              <div className="flex flex-col min-w-0 pr-1.5">
                <span className="text-white text-[11px] font-bold truncate max-w-[140px] sm:max-w-[180px]">{item.product.title}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400 text-xs font-black">{formatPEN(item.product.price)}</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-rose-500/90 text-white rounded font-black uppercase tracking-wider">
                    {item.product.isAuction ? 'Subasta' : 'En venta'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stream Info */}
          <Link 
            href={`/en-vivo/${item.seller.username}`}
            prefetch={true}
            onClick={() => setIsNavigating(true)}
            className="pointer-events-auto cursor-pointer block"
          >
            <h3 className="text-white font-extrabold text-sm sm:text-base drop-shadow-md hover:underline flex items-center gap-1.5">
              <span>@{item.seller.displayName}</span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.5 rounded-full">
                Vendedor
              </span>
            </h3>
            <p className="text-white/95 text-xs sm:text-sm mt-1 line-clamp-2 drop-shadow-md font-medium">{item.description}</p>
          </Link>

          {/* Live Comments Stream — Burbujas estilo TikTok Live */}
          {item.liveComments && item.liveComments.length > 0 && (
            <div className="max-h-24 overflow-hidden pointer-events-none flex flex-col justify-end gap-1.5 mt-1">
              {item.liveComments.slice(-3).map((comment) => (
                <div 
                  key={comment.id} 
                  className="w-fit max-w-[92%] bg-black/55 backdrop-blur-md rounded-full px-3 py-1 text-[11px] border border-white/10 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="font-bold text-amber-300 shrink-0">{comment.user}:</span>
                  <span className="text-white truncate font-medium">{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Right Interaction Panel */}
        <div className="absolute right-2.5 bottom-6 flex flex-col items-center gap-3.5 z-20 md:hidden pointer-events-auto">
          <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={true} isZoomed={isZoomed} setIsZoomed={setIsZoomed} onCommentClick={navigateToRoom} />
        </div>
      </div>

      {/* Desktop Right Interaction Panel */}
      <div className="hidden md:flex flex-col items-center gap-5 z-20 ml-4 self-end pb-8 pointer-events-auto">
        <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={false} isZoomed={isZoomed} setIsZoomed={setIsZoomed} onCommentClick={navigateToRoom} />
      </div>
    </div>
  )
}

function InteractionButtons({
  item,
  isLiked,
  setIsLiked,
  isMobile,
  onCommentClick,
}: {
  item: SocialFeedItem;
  isLiked: boolean;
  setIsLiked: (v: boolean) => void;
  isMobile: boolean;
  isZoomed: boolean;
  setIsZoomed: (v: boolean) => void;
  onCommentClick?: () => void;
}) {
  return (
    <>
      {/* Avatar / Profile */}
      <Link 
        href={`/en-vivo/${item.seller.username}`}
        prefetch={true}
        className="relative block cursor-pointer"
        title={`Ver en vivo de @${item.seller.displayName}`}
      >
        <div className={cn("w-12 h-12 rounded-full border-2 overflow-hidden", isMobile ? "border-white bg-zinc-800" : "border-background bg-muted")}>
          {item.seller.avatarUrl ? (
            <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center font-bold", isMobile ? "text-white" : "text-foreground")}>{item.seller.displayName[0]}</div>
          )}
        </div>
        <button className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full p-0.5 border-2", isMobile ? "border-black" : "border-background")}>
          <Plus className="w-3 h-3 text-white" />
        </button>
      </Link>

      {/* Like */}
      <button className="flex flex-col items-center gap-1 group" onClick={() => setIsLiked(!isLiked)}>
        <div className={`p-2 rounded-full ${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.likes + (isLiked ? 1 : 0)}</span>
      </button>

      {/* Comments / Room Entry */}
      <Link 
        href={`/en-vivo/${item.seller.username}`}
        prefetch={true}
        className="flex flex-col items-center gap-1 group"
        title="Abrir sala para comentar y comprar"
      >
        <div className={`p-2 rounded-full ${isMobile ? 'bg-background/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <MessageCircle className={`w-6 h-6 md:w-7 md:h-7 ${isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.comments}</span>
      </Link>

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
