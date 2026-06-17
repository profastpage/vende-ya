'use client'

import * as React from 'react'
import { Radio, Eye, Search } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { LiveStreamCard } from '@/components/vendeda/cards'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MOCK_STREAMS } from '@/lib/vendeda/mock-data'
import { formatViewers } from '@/lib/vendeda/format'

const breadcrumbs: Breadcrumb[] = [{ label: 'En vivo' }]

export default function LivePage() {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'live' | 'scheduled' | 'all'>('live')

  const filtered = MOCK_STREAMS.filter((s) => {
    if (filter === 'live' && !s.isLive) return false
    if (filter === 'scheduled' && s.status !== 'scheduled') return false
    if (query && !s.title.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const totalViewers = MOCK_STREAMS.filter((s) => s.isLive).reduce((sum, s) => sum + s.viewerCount, 0)

  return (
    <AppShell title="En vivo ahora" breadcrumbs={breadcrumbs} maxWidth="max-w-6xl">
      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transmisiones..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex gap-2">
          {(['live', 'scheduled', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 h-11 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'live' ? 'En vivo' : f === 'scheduled' ? 'Próximos' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Live summary banner */}
      <Card className="p-5 mb-6 bg-gradient-to-br from-salsa-500 to-salsa-700 text-white border-0 shadow-glow-salsa">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-lg">{MOCK_STREAMS.filter(s => s.isLive).length} transmisiones en vivo</div>
              <div className="text-sm text-white/80">
                {formatViewers(totalViewers)} ahora mismo
              </div>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            <span className="live-dot mr-1" /> LIVE
          </Badge>
        </div>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No hay transmisiones que coincidan.
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((s) => (
            <LiveStreamCard key={s.id} stream={s} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
