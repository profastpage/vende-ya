'use client'

import React from 'react'
import { Heart, MessageCircle, Share2, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPEN } from '@/lib/vendeda/format'
import { cn } from '@/lib/utils'

export type SocialFeedItem = {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  seller: { displayName: string; avatarUrl?: string };
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
  // Mobile-first immersive container, now adapting to light/dark themes
  return (
    <div className="flex w-full h-[100dvh] bg-background text-foreground overflow-hidden pt-0 md:pt-16">
      {/* Left Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-[250px] border-r border-border p-4 shrink-0 overflow-y-auto">
        <nav className="flex flex-col gap-2">
          <a href="/" className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted text-[#FE2C55] font-bold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Para ti
          </a>
          <a href="/siguiendo" className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted font-semibold text-foreground/90">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            Siguiendo
          </a>
          <a href="/marketplace" className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted font-semibold text-foreground/90">
            <ShoppingBag className="w-6 h-6" />
            Explorar Marketplace
          </a>
        </nav>
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-muted-foreground text-xs px-3">Inicia sesión para seguir a creadores, dar me gusta a videos y ver comentarios.</p>
          <button className="mt-4 w-full py-2.5 border border-[#FE2C55] text-[#FE2C55] font-bold rounded-lg hover:bg-[#FE2C55]/10">
            Iniciar sesión
          </button>
        </div>
      </aside>

      {/* Main Feed Container */}
      <div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-scroll no-scrollbar relative flex flex-col items-center">
        {feed.map((item, index) => (
          <FeedItem key={item.id} item={item} isActive={index === 0} />
        ))}
      </div>
    </div>
  )
}

function FeedItem({ item }: { item: SocialFeedItem; isActive: boolean }) {
  const [isLiked, setIsLiked] = React.useState(false)

  return (
    <div className="relative w-full md:w-auto h-[100dvh] md:h-[calc(100vh-64px)] snap-center snap-always flex justify-center shrink-0 md:py-4">
      {/* Container that acts as the mobile screen on desktop */}
      <div className="relative w-full md:w-[350px] lg:w-[400px] h-full bg-zinc-900 md:rounded-2xl overflow-hidden flex shrink-0">
        
        {/* Video Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        {/* Bottom Info & Product Pin (Inside Video Container) */}
        <div className="absolute bottom-4 left-4 right-16 flex flex-col justify-end gap-3 z-20 pb-16 md:pb-4 md:right-4">
          
          {/* Clickable Product Pin */}
          {item.product && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg w-fit max-w-[90%] cursor-pointer hover:bg-black/80 transition-colors"
            >
              <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-white text-xs font-medium line-clamp-1">{item.product.title}</span>
                <span className="text-[#FE2C55] font-bold text-sm">{formatPEN(item.product.price)}</span>
              </div>
              <button className="bg-[#FE2C55] text-white px-2 py-1.5 rounded-lg font-bold text-[10px] md:text-xs ml-auto shrink-0 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" /> Comprar
              </button>
            </motion.div>
          )}

          {/* Stream Info */}
          <div>
            <h3 className="text-white font-bold text-base drop-shadow-md hover:underline cursor-pointer">@{item.seller.displayName}</h3>
            <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow-md">{item.description}</p>
          </div>

          {/* Live Comments Stream */}
          {item.liveComments && item.liveComments.length > 0 && (
            <div className="h-32 overflow-y-auto no-scrollbar pointer-events-none space-y-2 mt-2" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)' }}>
              {item.liveComments.map(comment => (
                <div key={comment.id} className="text-sm">
                  <span className="font-bold text-white/80 drop-shadow-md">{comment.user}: </span>
                  <span className="text-white drop-shadow-md">{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Right Interaction Panel (Inside Video Container) - Hidden on md+ */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5 z-20 md:hidden">
          <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={true} />
        </div>
      </div>

      {/* Desktop Right Interaction Panel (Outside Video Container) - Visible only on md+ */}
      <div className="hidden md:flex flex-col items-center gap-5 z-20 ml-4 self-end pb-8">
        <InteractionButtons item={item} isLiked={isLiked} setIsLiked={setIsLiked} isMobile={false} />
      </div>
    </div>
  )
}

function InteractionButtons({ item, isLiked, setIsLiked, isMobile }: { item: SocialFeedItem, isLiked: boolean, setIsLiked: (v: boolean) => void, isMobile: boolean }) {
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
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Like */}
      <button className="flex flex-col items-center gap-1 group" onClick={() => setIsLiked(!isLiked)}>
        <div className={`p-2 rounded-full ${isMobile ? 'bg-black/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.likes + (isLiked ? 1 : 0)}</span>
      </button>

      {/* Comments */}
      <button className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-full ${isMobile ? 'bg-black/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <MessageCircle className={`w-6 h-6 md:w-7 md:h-7 ${isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.comments}</span>
      </button>

      {/* Share */}
      <button className="flex flex-col items-center gap-1 group">
        <div className={`p-2 rounded-full ${isMobile ? 'bg-black/20 backdrop-blur-sm' : 'bg-muted hover:bg-accent'} group-active:scale-90 transition-all`}>
          <Share2 className={`w-6 h-6 md:w-7 md:h-7 ${isMobile ? 'text-white' : 'text-foreground'}`} />
        </div>
        <span className={cn("text-xs font-semibold drop-shadow-md", isMobile ? "text-white/90" : "text-foreground/90")}>{item.shares}</span>
      </button>
    </>
  )
}
