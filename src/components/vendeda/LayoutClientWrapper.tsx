'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { DesktopTopNav } from "./DesktopTopNav"
import { MobileTopActions } from "./MobileTopActions"
import { MobileBottomNav } from "./MobileBottomNav"

export function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Suppress external browser/embed noise (Chromium WebGPU Windows diagnostic & PWA infobar notice)
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const originalWarn = console.warn
    console.warn = (...args: any[]) => {
      const text = typeof args[0] === 'string' ? args[0] : (args[0]?.message || '')
      if (
        text.includes('powerPreference') ||
        text.includes('requestAdapter') ||
        text.includes('was preloaded using link preload')
      ) {
        return
      }
      originalWarn.apply(console, args)
    }

    const originalLog = console.log
    console.log = (...args: any[]) => {
      const text = typeof args[0] === 'string' ? args[0] : ''
      if (text.includes('beforeinstallprompt') || text.includes('Banner not shown')) {
        return
      }
      originalLog.apply(console, args)
    }

    const originalInfo = console.info
    console.info = (...args: any[]) => {
      const text = typeof args[0] === 'string' ? args[0] : ''
      if (text.includes('beforeinstallprompt') || text.includes('Banner not shown')) {
        return
      }
      originalInfo.apply(console, args)
    }

    return () => {
      console.warn = originalWarn
      console.log = originalLog
      console.info = originalInfo
    }
  }, [])
  
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