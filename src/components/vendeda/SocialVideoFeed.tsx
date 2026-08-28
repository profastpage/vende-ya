'use client'
import { useMultiLiveViewers } from '@/hooks/useMultiLiveViewers'

import { InStreamCheckoutDrawer } from './InStreamCheckoutDrawer'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share2, Plus, ShoppingBag, Maximize, Minimize, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPEN } from '@/lib/vendeda/format'
import { toast } from 'sonner'
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
  // Mobile-first immersive container
  const viewersMap = useMultiLiveViewers(feed.map(f => ({ id: f.id, viewerCount: 0 })))
  // now adapting to light/dark themes
  return (
    <div className="flex w-full h-full bg-background text-foreground overflow-hidden">
      {/* Left Sidebar - Desktop Only */}
      

      {/* Main Feed Container */}
      <div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-auto overscroll-none no-scrollbar relative flex flex-col items-center touch-pan-y">
        {feed.map((item, index) => (
          <FeedItem key={item.id} item={item} viewers={viewersMap[item.id] || 0} />
        ))}
      </div>
    </div>
  )
}

function FeedItem({ item, viewers = 0 }: { item: SocialFeedItem; viewers?: number }) {
  const router = useRouter();
  const [isActive, setIsActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsActive(entry.isIntersecting);
        });
      },
      { threshold: 0.6 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const [isLiked, setIsLiked] = React.useState(false)
  const [isZoomed, setIsZoomed] = React.useState(false)

  return (
    <div ref={containerRef} className="relative w-full md:w-auto h-full snap-center snap-always flex justify-center shrink-0 md:py-4">
      {/* Container that acts as the mobile screen on desktop */}
      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-zinc-900 md:rounded-2xl overflow-hidden flex shrink-0">
        
        {/* Fondo de Portada (Imagen del Producto o Placeholder) */}
        <div 
          className="absolute inset-0 w-full h-full cursor-pointer z-0 group" 
          onClick={() => router.push(`/en-vivo/${item.seller.username}`)}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${item.product?.thumbnail || item.thumbnailUrl || 'https://placehold.co/1080x1920/1a1a1a/333333.png?text=Live'})` }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

          {/* Overlay central para invitar a entrar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 rounded-full bg-[#FE2C55] flex items-center justify-center animate-pulse shadow-lg shadow-[#FE2C55]/30 group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-white ml-2" fill="white" />
            </div>
            <span className="text-white font-bold mt-6 drop-shadow-md text-lg tracking-wide uppercase">Toca para entrar al En Vivo</span>
            
            {item.streamProvider && (
              <span className="mt-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-white/90">
                Transmitiendo vía {item.streamProvider}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10" />

        {/* Bottom Info & Product Pin (Inside Video Container) */}
        <div className="absolute bottom-4 left-4 right-16 flex flex-col justify-end gap-3 z-20 pb-16 md:pb-4 md:right-4">
          
          {/* Clickable Product Pin */}
          {item.product && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-muted/80 backdrop-blur-md p-2 rounded-xl border border-border shadow-lg w-fit max-w-[90%] cursor-pointer hover:bg-muted/90 transition-colors"
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
          <div>
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

        {/* Mobile Right Interaction Panel (Inside Video Container) - Hidden on md+ */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5 z-20 md:hidden">
          <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={true} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
        </div>
      </div>

      {/* Desktop Right Interaction Panel (Outside Video Container) - Visible only on md+ */}
      <div className="hidden md:flex flex-col items-center gap-5 z-20 ml-4 self-end pb-8">
        <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={false} isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
      </div>
    </div>
  )
}

function InteractionButtons({ item, isLiked, setIsLiked, isMobile, isZoomed, setIsZoomed }: { item: SocialFeedItem, isLiked: boolean, setIsLiked: (v: boolean) => void, isMobile: boolean, isZoomed: boolean, setIsZoomed: (v: boolean) => void }) {
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
