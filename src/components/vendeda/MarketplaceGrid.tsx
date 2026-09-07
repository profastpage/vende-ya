'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, MapPin, SlidersHorizontal, X, Check, Truck } from 'lucide-react'
import { formatPEN } from '@/lib/vendeda/format'
import { PERU_DEPARTMENTS } from '@/lib/vendeda/constants'

export type MarketplaceProduct = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  isFreeShipping: boolean;
  stock: number;
  category: string;
  seller: { displayName: string; isVerified: boolean; department?: string };
}

interface MarketplaceGridProps {
  products: MarketplaceProduct[];
  categories: string[];
}

const PRICE_RANGES = [
  { id: 'all', label: 'Todos los precios' },
  { id: 'under-50', label: 'Menos de S/ 50', max: 50 },
  { id: '50-150', label: 'S/ 50 - S/ 150', min: 50, max: 150 },
  { id: '150-300', label: 'S/ 150 - S/ 300', min: 150, max: 300 },
  { id: 'over-300', label: 'Más de S/ 300', min: 300 },
]

export function MarketplaceGrid({ products, categories }: MarketplaceGridProps) {
  const [activeCategory, setActiveCategory] = React.useState('Todo')
  const [activePriceRange, setActivePriceRange] = React.useState('all')
  const [activeDepartment, setActiveDepartment] = React.useState('all')
  const [onlyFreeShipping, setOnlyFreeShipping] = React.useState(false)

  const hasActiveFilters = activeCategory !== 'Todo' || activePriceRange !== 'all' || activeDepartment !== 'all' || onlyFreeShipping

  const resetFilters = () => {
    setActiveCategory('Todo')
    setActivePriceRange('all')
    setActiveDepartment('all')
    setOnlyFreeShipping(false)
  }

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'Todo' && p.category !== activeCategory) return false

    if (activePriceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === activePriceRange)
      if (range) {
        if (range.min !== undefined && p.price < range.min) return false
        if (range.max !== undefined && p.price > range.max) return false
      }
    }

    if (activeDepartment !== 'all') {
      const sellerDept = (p.seller.department || '').toLowerCase().trim()
      if (sellerDept !== activeDepartment.toLowerCase().trim()) return false
    }

    if (onlyFreeShipping && !p.isFreeShipping) return false

    return true
  })

  return (
    <div className="w-full bg-card min-h-screen pb-24 pt-2 px-4 md:px-6">
      
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

      {/* Advanced Filter Toolbar: Price Range, Department & Free Shipping */}
      <div className="mt-2 mb-6 p-3 rounded-2xl bg-muted/60 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Price Range Dropdown */}
          <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl">
            <span className="text-muted-foreground font-medium">Precio:</span>
            <select
              value={activePriceRange}
              onChange={(e) => setActivePriceRange(e.target.value)}
              className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer text-xs"
            >
              {PRICE_RANGES.map(range => (
                <option key={range.id} value={range.id} className="bg-background text-foreground">
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground font-medium">Ubicación:</span>
            <select
              value={activeDepartment}
              onChange={(e) => setActiveDepartment(e.target.value)}
              className="bg-transparent font-bold text-foreground focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-background text-foreground">Todo el Perú</option>
              {PERU_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept} className="bg-background text-foreground">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Free Shipping Pill */}
          <button
            onClick={() => setOnlyFreeShipping(!onlyFreeShipping)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              onlyFreeShipping
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                : 'bg-background border-border text-muted-foreground hover:text-foreground font-medium'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Envío Gratis</span>
            {onlyFreeShipping && <Check className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-muted-foreground font-medium">
            <strong className="text-foreground">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Masonry / Responsive Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-muted/30 p-8">
          <SlidersHorizontal className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No encontramos productos con estos filtros</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Prueba cambiando el rango de precio o seleccionando otra región del Perú.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90 transition-all"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8 mt-2">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: MarketplaceProduct }) {
  const [isLiked, setIsLiked] = React.useState(false)

  return (
    <Link href={`/productos/${product.id}`} className="group flex flex-col cursor-pointer block">
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

        <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 min-w-0">
            <span className="truncate">{product.seller.displayName}</span>
            {product.seller.isVerified && (
              <svg className="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
          {product.seller.department && (
            <span className="shrink-0 flex items-center gap-0.5 text-[10px] text-amber-500 font-medium">
              <MapPin className="w-2.5 h-2.5" />
              {product.seller.department}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
