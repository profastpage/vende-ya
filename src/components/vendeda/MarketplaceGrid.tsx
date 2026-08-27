'use client'

import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { formatPEN } from '@/lib/vendeda/format'

export type MarketplaceProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  isFreeShipping: boolean;
  stock: number;
  category: string;
  seller: { displayName: string; isVerified: boolean };
}

interface MarketplaceGridProps {
  products: MarketplaceProduct[];
  categories: string[];
}

export function MarketplaceGrid({ products, categories }: MarketplaceGridProps) {
  const [activeCategory, setActiveCategory] = React.useState('Todo')

  const filteredProducts = activeCategory === 'Todo' 
    ? products 
    : products.filter(p => p.category === activeCategory)

  return (
    <div className="w-full bg-card min-h-screen pb-24 pt-4 px-4 md:px-6">
      
      {/* Pill Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setActiveCategory('Todo')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            activeCategory === 'Todo' 
              ? 'bg-zinc-900 text-white' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Todo
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === cat 
                ? 'bg-zinc-900 text-white' 
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8 mt-2">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: MarketplaceProduct }) {
  const [isLiked, setIsLiked] = React.useState(false)

  return (
    <div className="group flex flex-col cursor-pointer">
      {/* Edge-to-edge Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100 mb-3">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Like Button */}
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-card/70 backdrop-blur-md shadow-sm border border-white hover:bg-card transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#FE2C55] text-[#FE2C55]' : 'text-zinc-600'}`} />
        </button>

        {/* Dynamic Labels */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          {product.isFreeShipping && (
            <span className="bg-card/90 backdrop-blur-md text-foreground px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
              Envío Gratis
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
              ¡Solo {product.stock} disp!
            </span>
          )}
        </div>
      </div>

      {/* Product Metadata (No Borders) */}
      <div className="flex flex-col px-1">
        <h3 className="text-foreground text-sm font-medium line-clamp-2 leading-tight">
          {product.title}
        </h3>
        
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-foreground text-lg font-bold">{formatPEN(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-zinc-400 text-xs line-through">{formatPEN(product.originalPrice)}</span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1">
          <span className="text-muted-foreground text-[11px] truncate">{product.seller.displayName}</span>
          {product.seller.isVerified && (
            <svg className="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
