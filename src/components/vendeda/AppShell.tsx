'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { MobileBottomNav } from '@/components/vendeda/MobileBottomNav'
import { DesktopTopNav } from '@/components/vendeda/DesktopTopNav'
import { QuickAuctionFab } from '@/components/vendeda/QuickAuctionFab'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/vendeda/constants'
import { ROUTES } from '@/lib/vendeda/routes'

/**
 * AppShell — shared layout for internal pages.
 * - Desktop: top nav + content
 * - Mobile: compact header + content + bottom nav
 * - Optional breadcrumb
 * - Optional back button
 */
export interface Breadcrumb {
  label: string
  href?: string
}

export function AppShell({
  children,
  title,
  breadcrumbs,
  showBack = true,
  showFAB = true,
  backHref = ROUTES.home,
  maxWidth = 'max-w-5xl',
}: {
  children: React.ReactNode
  title?: string
  breadcrumbs?: Breadcrumb[]
  showBack?: boolean
  showFAB?: boolean
  backHref?: string
  maxWidth?: string
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DesktopTopNav />

      {/* Mobile compact header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b pt-safe">
        <div className="flex items-center justify-between px-3 h-14">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <Link href={backHref} aria-label="Volver" className="p-2 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="text-base font-bold font-display truncate">{title ?? APP_NAME}</h1>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="text-[10px] text-muted-foreground truncate">
                  {breadcrumbs.map((bc, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <ChevronRight className="inline h-2 w-2 mx-0.5" />}
                      {bc.href ? (
                        <Link href={bc.href} className="hover:text-foreground">{bc.label}</Link>
                      ) : (
                        <span>{bc.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link href={ROUTES.home} className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-salsa-500 to-salsa-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Desktop breadcrumb bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="hidden md:block border-b bg-card/50">
          <div className={`mx-auto ${maxWidth} px-6 py-3 flex items-center gap-1 text-sm text-muted-foreground`}>
            <Link href={ROUTES.home} className="hover:text-foreground">Inicio</Link>
            {breadcrumbs.map((bc, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="h-3 w-3 mx-1" />
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-foreground">{bc.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <main className={`flex-1 w-full ${maxWidth} mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-12`}>
        {title && (
          <h1 className="hidden md:block text-3xl font-bold font-display mb-6">{title}</h1>
        )}
        {children}
      </main>

      {showFAB && <QuickAuctionFab />}
      <MobileBottomNav />
    </div>
  )
}
