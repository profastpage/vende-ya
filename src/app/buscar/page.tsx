'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { ProductCard, AuctionCard } from '@/components/vendeda/cards'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MOCK_PRODUCTS, MOCK_TRENDING_AUCTIONS } from '@/lib/vendeda/mock-data'

const breadcrumbs: Breadcrumb[] = [{ label: 'Buscar' }]

function SearchInner() {
  const params = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = React.useState(initialQ)

  const products = MOCK_PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  )
  const auctions = MOCK_TRENDING_AUCTIONS.filter((a) =>
    a.product?.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Buscar productos, subastas, vendedores..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!query && (
        <Card className="p-8 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Escribe para buscar en Vende Ya.
        </Card>
      )}

      {query && (
        <>
          {auctions.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">Subastas ({auctions.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {auctions.map((a) => <AuctionCard key={a.id} auction={a} />)}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Productos ({products.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {products.length === 0 && auctions.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>Sin resultados para "<strong>{query}</strong>"</p>
              <p className="text-xs mt-1">Prueba con otros términos.</p>
            </Card>
          )}
        </>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <AppShell title="Buscar" breadcrumbs={breadcrumbs} maxWidth="max-w-6xl">
      <React.Suspense fallback={<Card className="p-8 text-center text-muted-foreground">Cargando...</Card>}>
        <SearchInner />
      </React.Suspense>
    </AppShell>
  )
}
