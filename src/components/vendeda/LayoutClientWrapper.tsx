'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { DesktopTopNav } from "./DesktopTopNav"
import { MobileTopActions } from "./MobileTopActions"
import { MobileBottomNav } from "./MobileBottomNav"

export function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define full-screen routes where navs and padding are completely hidden.
  // We use strict matching so that index pages like /en-vivo and /subastas still scroll normally!
  const isFullScreenRoute = 
    (pathname?.startsWith('/en-vivo/') && pathname !== '/en-vivo') || 
    (pathname?.startsWith('/subastas/') && pathname !== '/subastas') || 
    pathname === '/studio'

  if (isFullScreenRoute) {
    return <main className="w-full h-[100dvh] bg-black overflow-hidden relative">{children}</main>
  }

  return (
    <>
      <DesktopTopNav />
      <MobileTopActions />
      {/* Dynamic background: Feed is always black to emulate native apps, other pages respect theme */}
      <main className={`flex flex-col flex-1 w-full pt-14 md:pt-16 pb-32 md:pb-0 overflow-y-auto overscroll-none ${pathname === '/' ? 'bg-black text-white' : 'bg-background text-foreground'}`}>
        {children}
      </main>
      <MobileBottomNav />
    </>
  )
}