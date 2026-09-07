'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, Loader2, Radio, Package, User, ArrowRight, BadgeCheck } from 'lucide-react'
import { searchDatabase, type SearchResults } from '@/app/buscar/actions'
import { formatPEN } from '@/lib/vendeda/format'
import { cn } from '@/lib/utils'

interface SearchWithSuggestionsProps {
  autoFocus?: boolean;
  onClose?: () => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function SearchWithSuggestions({
  autoFocus = false,
  onClose,
  className,
  inputClassName,
  placeholder = "Buscar productos, subastas, vendedores..."
}: SearchWithSuggestionsProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResults>({ products: [], auctions: [], sellers: [] })
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus if requested
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounced search
  React.useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults({ products: [], auctions: [], sellers: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      searchDatabase(q)
        .then((res) => {
          setResults(res)
          setLoading(false)
          setIsOpen(true)
        })
        .catch((err) => {
          console.error('Error fetching suggestions:', err)
          setLoading(false)
        })
    }, 180)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    onClose?.()
    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelectResult = () => {
    setIsOpen(false)
    onClose?.()
  }

  const hasProducts = results.products.length > 0
  const hasAuctions = results.auctions.length > 0
  const hasSellers = results.sellers.length > 0
  const hasAnyResults = hasProducts || hasAuctions || hasSellers
  const q = query.trim()

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative w-full flex items-center" role="search">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen && e.target.value.trim()) setIsOpen(true)
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false)
              inputRef.current?.blur()
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 pl-10 pr-9 rounded-xl bg-muted/80 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/50 transition-all",
            inputClassName
          )}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Borrar texto"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Floating Suggestions Dropdown */}
      {isOpen && q && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 max-h-[75vh] sm:max-h-[460px] flex flex-col">
          <div className="overflow-y-auto p-2 divide-y divide-border/50 flex-1">
            
            {/* 1. Transmisiones En Vivo */}
            {hasAuctions && (
              <div className="py-2 first:pt-1">
                <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    En Vivo Ahora
                  </span>
                  <span>{results.auctions.length}</span>
                </div>
                <div className="space-y-1">
                  {results.auctions.slice(0, 2).map((a) => {
                    const link = a.seller?.username ? `/en-vivo/${a.seller.username}` : `/subastas/${a.id}`
                    return (
                      <Link
                        key={a.id}
                        href={link}
                        onClick={handleSelectResult}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/80 transition-colors group"
                      >
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-white/10">
                          <img
                            src={a.product?.images?.[0] || 'https://placehold.co/100x100/1a1a1a/ffffff.png?text=Live'}
                            alt={a.product?.title || 'Live'}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-rose-600 text-white text-[8px] font-black text-center uppercase leading-none py-0.5">
                            LIVE
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-rose-400 transition-colors">
                            {a.product?.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {a.seller?.displayName || 'Streamer'}
                          </p>
                        </div>
                        <Radio className="h-4 w-4 text-rose-500 shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. Productos */}
            {hasProducts && (
              <div className="py-2 first:pt-1">
                <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3 w-3" />
                    Productos
                  </span>
                  <span>{results.products.length}</span>
                </div>
                <div className="space-y-1">
                  {results.products.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      href={`/productos/${p.id}`}
                      onClick={handleSelectResult}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/80 transition-colors group"
                    >
                      <div className="h-11 w-11 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                        <img
                          src={p.images?.[0] || 'https://placehold.co/100x100/1a1a1a/ffffff.png?text=P'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-amber-400 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {p.seller?.displayName || 'Vendedor'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-400 tabular-nums">
                          {formatPEN(p.basePrice)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Vendedores */}
            {hasSellers && (
              <div className="py-2 first:pt-1">
                <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-sky-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Vendedores
                  </span>
                  <span>{results.sellers.length}</span>
                </div>
                <div className="space-y-1">
                  {results.sellers.slice(0, 3).map((s) => (
                    <Link
                      key={s.id}
                      href={`/vendedores/${s.username}`}
                      onClick={handleSelectResult}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/80 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt={s.displayName} className="w-full h-full object-cover" />
                        ) : (
                          (s.displayName?.charAt(0) || 'V').toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate flex items-center gap-1 group-hover:text-sky-400 transition-colors">
                          {s.displayName}
                          {s.isVerified && <BadgeCheck className="h-3 w-3 text-sky-400 shrink-0" />}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          @{s.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!hasAnyResults && !loading && (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  No encontramos resultados directos para <span className="text-amber-400 font-bold">"{q}"</span>
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2 text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  Buscar en todo el catálogo <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Footer: Ver todos */}
          {hasAnyResults && (
            <div className="p-2 border-t border-border bg-muted/50">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 px-3 rounded-xl bg-accent hover:bg-accent/80 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Ver todos los resultados para "{q}"</span>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}