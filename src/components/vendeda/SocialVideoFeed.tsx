'use client'

import React from 'react'
import { Heart, MessageCircle, Share2, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPEN } from '@/lib/vendeda/format'

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
  // Mobile-first dark immersive container
  return (
    <div className="bg-black w-full h-[100dvh] snap-y snap-mandatory overflow-y-scroll no-scrollbar relative">
      {feed.map((item, index) => (
        <FeedItem key={item.id} item={item} isActive={index === 0} />
      ))}
    </div>
  )
}

function FeedItem({ item }: { item: SocialFeedItem; isActive: boolean }) {
  const [isLiked, setIsLiked] = React.useState(false)

  return (
    <div className="relative w-full h-[100dvh] snap-center snap-always bg-black flex justify-center overflow-hidden">
      {/* Video Background (simulated with image for now, ideally an HTML5 video) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Right Interaction Panel */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
        
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-zinc-800">
            {item.seller.avatarUrl ? (
              <img src={item.seller.avatarUrl} alt={item.seller.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">{item.seller.displayName[0]}</div>
            )}
          </div>
          <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full p-0.5 border-2 border-black">
            <Plus className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Like */}
        <button className="flex flex-col items-center gap-1 group" onClick={() => setIsLiked(!isLiked)}>
          <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{item.likes + (isLiked ? 1 : 0)}</span>
        </button>

        {/* Comments */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{item.comments}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{item.shares}</span>
        </button>
      </div>

      {/* Bottom Info & Product Pin */}
      <div className="absolute bottom-16 left-4 right-20 flex flex-col justify-end gap-3 z-20 pb-4">
        
        {/* Clickable Product Pin */}
        {item.product && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg w-fit max-w-full cursor-pointer hover:bg-black/50 transition-colors"
          >
            <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex flex-col mr-2">
              <span className="text-white text-xs font-medium line-clamp-1">{item.product.title}</span>
              <span className="text-[#FE2C55] font-bold text-sm">{formatPEN(item.product.price)}</span>
            </div>
            <button className="bg-[#FE2C55] text-white px-3 py-1.5 rounded-lg font-bold text-xs ml-auto shrink-0 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Comprar
            </button>
          </motion.div>
        )}

        {/* Stream Info */}
        <div>
          <h3 className="text-white font-bold text-base drop-shadow-md">@{item.seller.displayName}</h3>
          <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow-md">{item.description}</p>
        </div>

        {/* Live Comments Stream (Gradient Masked) */}
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
    </div>
  )
}
