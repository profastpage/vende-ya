'use client'

import * as React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { ProductCard, AuctionCard } from '@/components/vendeda/cards'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CategoryRail } from '@/components/vendeda/CategorySidebar'
import { MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'

const breadcrumbs: Breadcrumb[] = [{ label: 'Marketplace' }]

export default function MarketplacePage() {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [view, setView] = React.useState<'products' | 'auctions'>('products')
  const [showFilters, setShowFilters] = React.useState(false)
  const [maxPrice, setMaxPrice] = React.useState('')

  const filtered = React.useMemo(() => {
    let list = view === 'products'
      ? MOCK_PRODUCTS
      : MOCK_TRENDING_AUCTIONS.map((a) => ({ type: 'auction' as const, data: a }))

    if (view === 'products') {
      let products = MOCK_PRODUCTS
      if (query) {
        products = products.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        )
      }
      if (category !== 'all') {
        products = products.filter((p) => p.category?.slug === category)
      }
      if (maxPrice) {
        products = products.filter((p) => p.basePrice <= parseFloat(maxPrice))
      }
      return products.map((p) => ({ type: 'product' as const, data: p }))
    } else {
      let auctions = MOCK_TRENDING_AUCTIONS
      if (query) {
        auctions = auctions.filter((a) => a.product?.title.toLowerCase().includes(query.toLowerCase()))
      }
      if (maxPrice) {
        auctions = auctions.filter((a) => a.currentPrice <= parseFloat(maxPrice))
      }
      return auctions.map((a) => ({ type: 'auction' as const, data: a }))
    }
  }, [view, query, category, maxPrice])

  return (
    <AppShell title="Marketplace" breadcrumbs={breadcrumbs} maxWidth="max-w-6xl">
      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, marcas, vendedores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters((v) => !v)}
          className="h-11"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filtros</h3>
            <button
              onClick={() => { setCategory('all'); setMaxPrice(''); setQuery('') }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          </div>
          <CategoryRail active={category} onSelect={setCategory} />
          <div>
            <label className="text-xs text-muted-foreground">Precio máximo: S/. {maxPrice || '∞'}</label>
            <input
              type="range" min="0" max="2000" step="50"
              value={maxPrice || '0'}
              onChange={(e) => setMaxPrice(e.target.value === '0' ? '' : e.target.value)}
              className="w-full accent-salsa-500"
            />
          </div>
        </Card>
      )}

      {/* View toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('products')}
          className={`px-4 h-10 rounded-lg text-sm font-medium transition-colors ${
            view === 'products' ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
          }`}
        >
          Productos ({MOCK_PRODUCTS.length})
        </button>
        <button
          onClick={() => setView('auctions')}
          className={`px-4 h-10 rounded-lg text-sm font-medium transition-colors ${
            view === 'auctions' ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
          }`}
        >
          Subastas ({MOCK_TRENDING_AUCTIONS.length})
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No encontramos resultados. Prueba con otros filtros.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filtered.map((item) => (
            item.type === 'auction'
              ? <AuctionCard key={item.data.id} auction={item.data} />
              : <ProductCard key={item.data.id} product={item.data} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
