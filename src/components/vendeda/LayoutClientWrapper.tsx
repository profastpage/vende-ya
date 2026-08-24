'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { DesktopTopNav } from "./DesktopTopNav"
import { MobileTopActions } from "./MobileTopActions"
import { MobileBottomNav } from "./MobileBottomNav"

export function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Define full-screen routes where navs and padding are completely hidden
  const isFullScreenRoute = pathname?.startsWith('/en-vivo') || pathname?.startsWith('/subastas') || pathname?.startsWith('/studio')

  if (isFullScreenRoute) {
    return <main className="w-full h-[100dvh] bg-black overflow-hidden relative">{children}</main>
  }

  return (
    <>
      <DesktopTopNav />
      <MobileTopActions />
      <main className="flex-1 w-full pt-14 md:pt-16 pb-24 md:pb-0 bg-background text-foreground">
        {children}
      </main>
      <MobileBottomNav />
    </>
  )
}