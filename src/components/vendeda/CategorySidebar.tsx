'use client'

import * as React from 'react'
import {
  Shirt, Smartphone, Home, Sparkles, Footprints, Dumbbell, Gamepad2,
  Palette, Utensils, Hash, ChevronRight,
} from 'lucide-react'
import { CATEGORIES } from '@/lib/vendeda/constants'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/vendeda/types'

const ICON_MAP: Record<string, React.ElementType> = {
  shirt: Shirt, smartphone: Smartphone, home: Home, sparkles: Sparkles,
  footprints: Footprints, dumbbell: Dumbbell, 'gamepad-2': Gamepad2,
  palette: Palette, utensils: Utensils,
}

export function CategorySidebar({
  active, onSelect,
}: {
  active: string
  onSelect: (slug: string) => void
}) {
  return (
    <aside
      className="hidden lg:flex flex-col gap-1 w-56 shrink-0"
      aria-label="Categorías"
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
        Categorías
      </h2>
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          active === 'all'
            ? 'bg-salsa-50 text-salsa-700'
            : 'hover:bg-muted text-foreground'
        )}
      >
        <Hash className="h-4 w-4" /> Todo
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon ?? ''] ?? Hash
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
              active === cat.slug
                ? 'bg-salsa-50 text-salsa-700'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <Icon className={cn(
              'h-4 w-4 transition-colors',
              active === cat.slug ? 'text-salsa-500' : 'text-muted-foreground group-hover:text-foreground'
            )} />
            <span className="flex-1 text-left">{cat.nameEs}</span>
            <ChevronRight className={cn(
              'h-3.5 w-3.5 transition-opacity',
              active === cat.slug ? 'opacity-100' : 'opacity-0'
            )} />
          </button>
        )
      })}
    </aside>
  )
}

/** Mobile horizontal scrolling chip rail. */
export function CategoryRail({
  active, onSelect,
}: {
  active: string
  onSelect: (slug: string) => void
}) {
  return (
    <div className="md:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 pb-1">
        <button
          onClick={() => onSelect('all')}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            active === 'all' ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
          )}
        >
          Todo
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              active === cat.slug ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
            )}
          >
            {cat.nameEs}
          </button>
        ))}
      </div>
    </div>
  )
}
